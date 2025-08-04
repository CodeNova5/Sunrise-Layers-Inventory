import mongoose from 'mongoose';
import UserDAO from '@/lib/common/dao/user';
import UserModel from '@/lib/common/models/user';
import GroupModel from '@/lib/common/models/group';
import { IntegrityError, EntityNotFound, PasswordError, PageNotFound } from '@/lib/errors';
import bcrypt from 'bcrypt';

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked_token')
  }))
}));

describe('UserDAO', () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock bcrypt functions
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('addUser', () => {
    it('should add a new user successfully', async () => {
      // Mock UserModel.countDocuments and save
      const countDocumentsMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0)
      });
      UserModel.countDocuments = countDocumentsMock;

      const saveMock = jest.fn().mockResolvedValue(undefined);
      
      // Mock the UserModel constructor
      jest.spyOn(UserModel.prototype, 'save').mockImplementation(saveMock);

      // Mock transformUser result
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        password: 'hashed_password',
        status: 'active',
        permissions: [],
      };
      
      // Mock findOne after save to get the created user
      UserModel.findOne = jest.fn().mockResolvedValue(mockUser);
      
      // Mock GroupModel.find for transformUser
      GroupModel.find = jest.fn().mockResolvedValue([]);

      const result = await UserDAO.addUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '01234567890',
        password: 'Password123!'
      });

      expect(countDocumentsMock).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        isDeleted: false
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(result).toEqual(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        groups: []
      }));
    });

    it('should throw IntegrityError if email already exists', async () => {
      // Mock UserModel.countDocuments to return 1 (email exists)
      UserModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1)
      });

      await expect(UserDAO.addUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        phone: '01234567890',
        password: 'Password123!'
      })).rejects.toThrow(IntegrityError);
    });
  });

  describe('getUsers', () => {
    it('should get paginated users', async () => {
      // Mock necessary functions
      const countDocumentsMock = jest.fn().mockResolvedValue(20);
      UserModel.countDocuments = jest.fn().mockReturnValue({
        exec: countDocumentsMock
      });

      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+2341234567890',
          status: 'active',
          permissions: []
        },
        {
          _id: new mongoose.Types.ObjectId(),
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+2341234567891',
          status: 'active',
          permissions: []
        }
      ];

      UserModel.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers)
      });

      // Mock GroupModel.find for transformUser
      GroupModel.find = jest.fn().mockResolvedValue([]);

      const result = await UserDAO.getUsers({
        filters: { status: 'active' },
        page: 1,
        limit: 10
      });

      expect(UserModel.countDocuments).toHaveBeenCalledWith({
        status: 'active',
        isDeleted: false
      });
      
      expect(result.totalDocs).toBe(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
      expect(result.users).toHaveLength(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.next).toBe(2);
    });

    it('should throw PageNotFound if page is less than 1', async () => {
      await expect(UserDAO.getUsers({
        filters: {},
        page: 0,
        limit: 10
      })).rejects.toThrow(PageNotFound);
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user and return token', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2341234567890',
        password: 'hashed_password',
        status: 'active',
        permissions: []
      };

      UserModel.findOne = jest.fn().mockResolvedValue(mockUser);
      GroupModel.find = jest.fn().mockResolvedValue([]);

      const result = await UserDAO.authenticateUser('john@example.com', 'Password123!');

      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
        isDeleted: false
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed_password');
      expect(result).toHaveProperty('token', 'mocked_token');
      expect(result).toHaveProperty('user');
    });

    it('should throw EntityNotFound if user not found', async () => {
      UserModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(UserDAO.authenticateUser('nonexistent@example.com', 'Password123!')).rejects.toThrow(EntityNotFound);
    });

    it('should throw PasswordError if password is invalid', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2341234567890',
        password: 'hashed_password',
        status: 'active',
        permissions: []
      };

      UserModel.findOne = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(UserDAO.authenticateUser('john@example.com', 'WrongPassword123!')).rejects.toThrow(PasswordError);
    });
  });

  // Add more tests for the other UserDAO methods like updateUser, deleteUser, getUser, setUserStatus
}); 