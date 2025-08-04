import mongoose from 'mongoose';
import CustomerDAO from '@/lib/garage/dao/customer';
import CustomerModel from '@/lib/garage/models/customer';
import { EntityNotFound } from '@/lib/errors';

describe('CustomerDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCustomer', () => {
    it('should add a new customer successfully', async () => {
      const mockCustomer = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        isDeleted: false
      };

      // Mock the CustomerModel constructor
      const saveMock = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(CustomerModel.prototype, 'save').mockImplementation(saveMock);
      
      // Mock properties
      jest.spyOn(CustomerModel.prototype, '_id', 'get').mockReturnValue(mockCustomer._id);
      jest.spyOn(CustomerModel.prototype, 'firstName', 'get').mockReturnValue(mockCustomer.firstName);
      jest.spyOn(CustomerModel.prototype, 'lastName', 'get').mockReturnValue(mockCustomer.lastName);
      jest.spyOn(CustomerModel.prototype, 'email', 'get').mockReturnValue(mockCustomer.email);
      jest.spyOn(CustomerModel.prototype, 'phone', 'get').mockReturnValue(mockCustomer.phone);
      jest.spyOn(CustomerModel.prototype, 'isDeleted', 'get').mockReturnValue(mockCustomer.isDeleted);

      const userId = new mongoose.Types.ObjectId();
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '01234567890'
      };

      const result = await CustomerDAO.addCustomer(userId, customerData);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      });
    });
  });

  describe('listCustomers', () => {
    it('should list customers with filters', async () => {
      const mockCustomers = [
        {
          _id: new mongoose.Types.ObjectId(),
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+2341234567890',
          isDeleted: false
        },
        {
          _id: new mongoose.Types.ObjectId(),
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+2341234567891',
          isDeleted: false
        }
      ];

      CustomerModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCustomers)
      });

      const params = { firstName: 'J' };
      const result = await CustomerDAO.listCustomers(params);

      expect(CustomerModel.find).toHaveBeenCalledWith({
        isDeleted: false,
        firstName: 'J'
      });
      expect(result).toEqual(mockCustomers);
    });

    it('should list deleted customers when internal is true', async () => {
      const mockCustomers = [
        {
          _id: new mongoose.Types.ObjectId(),
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+2341234567890',
          isDeleted: true
        }
      ];

      CustomerModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCustomers)
      });

      const params = {};
      const result = await CustomerDAO.listCustomers(params, true);

      expect(CustomerModel.find).toHaveBeenCalledWith({
        isDeleted: true
      });
      expect(result).toEqual(mockCustomers);
    });
  });

  describe('getCustomer', () => {
    it('should get a customer by id', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockCustomer = {
        _id: mockId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        isDeleted: false
      };

      CustomerModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCustomer)
      });

      const result = await CustomerDAO.getCustomer(mockId, {});

      expect(CustomerModel.findOne).toHaveBeenCalledWith({
        _id: mockId,
        isDeleted: false
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should get a customer by id and additional params', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockCustomer = {
        _id: mockId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        isDeleted: false
      };

      CustomerModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCustomer)
      });

      const params = { email: 'john.doe@example.com' };
      const result = await CustomerDAO.getCustomer(mockId, params);

      expect(CustomerModel.findOne).toHaveBeenCalledWith({
        _id: mockId,
        isDeleted: false,
        email: 'john.doe@example.com'
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should get a deleted customer when internal is true', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockCustomer = {
        _id: mockId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        isDeleted: true
      };

      CustomerModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCustomer)
      });

      const result = await CustomerDAO.getCustomer(mockId, {}, true);

      expect(CustomerModel.findOne).toHaveBeenCalledWith({
        _id: mockId,
        isDeleted: true
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      const customerId = new mongoose.Types.ObjectId();
      
      const mockCustomer = {
        _id: customerId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(undefined)
      };

      CustomerModel.findOne = jest.fn().mockResolvedValue(mockCustomer);

      const updateData = {
        firstName: 'Johnny',
        email: 'johnny.doe@example.com'
      };

      const result = await CustomerDAO.updateCustomer(userId, customerId, updateData);

      expect(CustomerModel.findOne).toHaveBeenCalledWith({
        _id: customerId,
        isDeleted: false
      });
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        _id: customerId,
        firstName: 'Johnny',
        email: 'johnny.doe@example.com'
      }));
    });

    it('should throw EntityNotFound if customer not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const customerId = new mongoose.Types.ObjectId();
      
      CustomerModel.findOne = jest.fn().mockResolvedValue(null);

      const updateData = {
        firstName: 'Johnny'
      };

      await expect(CustomerDAO.updateCustomer(userId, customerId, updateData)).rejects.toThrow(EntityNotFound);
    });
  });

  describe('deleteCustomer', () => {
    it('should mark a customer as deleted', async () => {
      const userId = new mongoose.Types.ObjectId();
      const customerId = new mongoose.Types.ObjectId();
      
      const mockCustomer = {
        _id: customerId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2341234567890',
        isDeleted: true
      };

      CustomerModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockCustomer);

      const result = await CustomerDAO.deleteCustomer(userId, customerId);

      expect(CustomerModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: customerId, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      expect(result).toEqual(mockCustomer);
    });

    it('should throw EntityNotFound if customer not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const customerId = new mongoose.Types.ObjectId();
      
      CustomerModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await expect(CustomerDAO.deleteCustomer(userId, customerId)).rejects.toThrow(EntityNotFound);
    });
  });
}); 