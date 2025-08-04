import mongoose from 'mongoose';
import LogDAO from '@/lib/common/dao/log';
import LogModel from '@/lib/common/models/log';
import { PageNotFound } from '@/lib/errors';

describe('LogDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logCreation', () => {
    it('should create a creation log entry', async () => {
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        action: 'create',
        display: ['User John Doe was created'],
        target: 'User',
        targetId: new mongoose.Types.ObjectId(),
        loggerId: new mongoose.Types.ObjectId(),
        details: { firstName: 'John', lastName: 'Doe' }
      };

      // Mock the save method
      const saveMock = jest.fn().mockResolvedValue(mockLog);
      jest.spyOn(LogModel.prototype, 'save').mockImplementation(saveMock);

      const logParams = {
        display: ['User John Doe was created'],
        target: 'User',
        targetId: mockLog.targetId,
        loggerId: mockLog.loggerId,
        details: { firstName: 'John', lastName: 'Doe' }
      };

      const result = await LogDAO.logCreation(logParams);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });
  });

  describe('logModification', () => {
    it('should create a modification log entry', async () => {
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        action: 'update',
        display: ['User John Doe was updated'],
        target: 'User',
        targetId: new mongoose.Types.ObjectId(),
        loggerId: new mongoose.Types.ObjectId(),
        details: { firstName: 'Johnny', previousName: 'John' }
      };

      // Mock the save method
      const saveMock = jest.fn().mockResolvedValue(mockLog);
      jest.spyOn(LogModel.prototype, 'save').mockImplementation(saveMock);

      const logParams = {
        display: ['User John Doe was updated'],
        target: 'User',
        targetId: mockLog.targetId,
        loggerId: mockLog.loggerId,
        details: { firstName: 'Johnny', previousName: 'John' }
      };

      const result = await LogDAO.logModification(logParams);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });
  });

  describe('logDeletion', () => {
    it('should create a deletion log entry', async () => {
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        action: 'delete',
        display: ['User John Doe was deleted'],
        target: 'User',
        targetId: new mongoose.Types.ObjectId(),
        loggerId: new mongoose.Types.ObjectId()
      };

      // Mock the save method
      const saveMock = jest.fn().mockResolvedValue(mockLog);
      jest.spyOn(LogModel.prototype, 'save').mockImplementation(saveMock);

      const logParams = {
        display: ['User John Doe was deleted'],
        target: 'User',
        targetId: mockLog.targetId,
        loggerId: mockLog.loggerId
      };

      const result = await LogDAO.logDeletion(logParams);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });
  });

  describe('getLogs', () => {
    it('should get paginated logs', async () => {
      // Mock necessary functions
      const countDocumentsMock = jest.fn().mockResolvedValue(30);
      LogModel.countDocuments = jest.fn().mockReturnValue({
        exec: countDocumentsMock
      });

      const mockLogs = [
        {
          _id: new mongoose.Types.ObjectId(),
          action: 'create',
          display: ['User John Doe was created'],
          target: 'User',
          targetId: new mongoose.Types.ObjectId(),
          loggerId: new mongoose.Types.ObjectId(),
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          action: 'update',
          display: ['User Jane Smith was updated'],
          target: 'User',
          targetId: new mongoose.Types.ObjectId(),
          loggerId: new mongoose.Types.ObjectId(),
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          action: 'delete',
          display: ['Good Product1 was deleted'],
          target: 'Good',
          targetId: new mongoose.Types.ObjectId(),
          loggerId: new mongoose.Types.ObjectId(),
          createdAt: new Date()
        }
      ];

      LogModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs)
      });

      const result = await LogDAO.getLogs({
        filters: { target: 'User' },
        page: 2,
        limit: 10,
        order: -1
      });

      expect(LogModel.countDocuments).toHaveBeenCalledWith({ target: 'User' });
      expect(LogModel.find).toHaveBeenCalledWith({ target: 'User' });
      
      expect(result.totalDocs).toBe(30);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.logs).toHaveLength(3);
      expect(result.hasPrevPage).toBe(true);
      expect(result.prev).toBe(1);
      expect(result.hasNextPage).toBe(true);
      expect(result.next).toBe(3);
    });

    it('should throw PageNotFound if page is less than 1', async () => {
      await expect(LogDAO.getLogs({
        filters: {},
        page: 0,
        limit: 10,
        order: -1
      })).rejects.toThrow(PageNotFound);
    });

    it('should throw PageNotFound if limit is less than 1', async () => {
      await expect(LogDAO.getLogs({
        filters: {},
        page: 1,
        limit: 0,
        order: -1
      })).rejects.toThrow(PageNotFound);
    });

    it('should throw PageNotFound if page is greater than totalPages', async () => {
      // Mock to return 20 total documents (2 pages with limit 10)
      LogModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(20)
      });

      await expect(LogDAO.getLogs({
        filters: {},
        page: 3, // This is greater than totalPages (2)
        limit: 10,
        order: -1
      })).rejects.toThrow(PageNotFound);
    });

    it('should set order to -1 if invalid order is provided', async () => {
      // Mock necessary functions
      LogModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(10)
      });

      const sortMock = jest.fn().mockReturnThis();
      
      LogModel.find = jest.fn().mockReturnValue({
        sort: sortMock,
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      });

      await LogDAO.getLogs({
        filters: {},
        page: 1,
        limit: 10,
        order: 2 as any // Invalid order
      });

      // Check that sort was called with default order -1
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
}); 