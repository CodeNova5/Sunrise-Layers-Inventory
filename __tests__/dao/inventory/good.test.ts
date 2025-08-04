import mongoose from 'mongoose';
import GoodDAO from '@/lib/inventory/dao/good';
import { GoodModel } from '@/lib/inventory/models/good';
import { OrderItemModel } from '@/lib/inventory/models/orderItem';
import { OrderModel } from '@/lib/inventory/models/order';
import { EntityNotFound, IntegrityError, PageNotFound, ValueError } from '@/lib/errors';

describe('GoodDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addGood', () => {
    it('should add a new good successfully', async () => {
      const mockGood = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Good',
        costPrice: 100,
        qty: 10,
        description: 'Test description',
        minQty: 5,
        productId: 'PROD123'
      };

      // Mock the GoodModel constructor
      const saveMock = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(GoodModel.prototype, 'save').mockImplementation(saveMock);
      
      // Mock the GoodModel to return the created good
      jest.spyOn(GoodModel.prototype, '_id', 'get').mockReturnValue(mockGood._id);
      jest.spyOn(GoodModel.prototype, 'name', 'get').mockReturnValue(mockGood.name);
      jest.spyOn(GoodModel.prototype, 'costPrice', 'get').mockReturnValue(mockGood.costPrice);
      jest.spyOn(GoodModel.prototype, 'qty', 'get').mockReturnValue(mockGood.qty);
      jest.spyOn(GoodModel.prototype, 'description', 'get').mockReturnValue(mockGood.description);
      jest.spyOn(GoodModel.prototype, 'minQty', 'get').mockReturnValue(mockGood.minQty);
      jest.spyOn(GoodModel.prototype, 'productId', 'get').mockReturnValue(mockGood.productId);

      const goodData = {
        name: 'Test Good',
        costPrice: 100,
        qty: 10,
        description: 'Test description',
        minQty: 5,
        productId: 'PROD123'
      };

      const result = await GoodDAO.addGood(goodData);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toMatchObject(goodData);
    });
  });

  describe('getGood', () => {
    it('should get a good by id', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockGood = {
        _id: mockId,
        name: 'Test Good',
        costPrice: 100,
        qty: 10,
        description: 'Test description',
        minQty: 5,
        productId: 'PROD123'
      };

      GoodModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockGood)
      });

      const result = await GoodDAO.getGood(mockId);

      expect(GoodModel.findOne).toHaveBeenCalledWith({ _id: mockId });
      expect(result).toEqual(mockGood);
    });

    it('should get a good by filters', async () => {
      const mockGood = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Good',
        costPrice: 100,
        qty: 10,
        description: 'Test description',
        minQty: 5,
        productId: 'PROD123'
      };

      GoodModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockGood)
      });

      const result = await GoodDAO.getGood(undefined, { name: 'Test Good' });

      expect(GoodModel.findOne).toHaveBeenCalledWith({ name: 'Test Good' });
      expect(result).toEqual(mockGood);
    });

    it('should throw ValueError if no id or filters provided', async () => {
      await expect(GoodDAO.getGood()).rejects.toThrow(ValueError);
    });

    it('should throw EntityNotFound if good not found', async () => {
      const mockId = new mongoose.Types.ObjectId();
      
      GoodModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(GoodDAO.getGood(mockId)).rejects.toThrow(EntityNotFound);
    });
  });

  describe('getGoods', () => {
    it('should get paginated goods', async () => {
      // Mock necessary functions
      const countDocumentsMock = jest.fn().mockResolvedValue(20);
      GoodModel.countDocuments = jest.fn().mockReturnValue({
        exec: countDocumentsMock
      });

      const mockGoods = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Good 1',
          costPrice: 100,
          qty: 10,
          description: 'Description 1',
          minQty: 5,
          productId: 'PROD1'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Good 2',
          costPrice: 200,
          qty: 20,
          description: 'Description 2',
          minQty: 10,
          productId: 'PROD2'
        }
      ];

      GoodModel.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockGoods)
      });

      const result = await GoodDAO.getGoods({
        filters: { productId: 'PROD' },
        page: 1,
        limit: 10
      });

      expect(GoodModel.countDocuments).toHaveBeenCalledWith({ productId: 'PROD' });
      expect(result.totalDocs).toBe(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
      expect(result.goods).toHaveLength(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.next).toBe(2);
    });

    it('should throw PageNotFound if page is less than 1', async () => {
      await expect(GoodDAO.getGoods({
        filters: {},
        page: 0,
        limit: 10
      })).rejects.toThrow(PageNotFound);
    });
  });

  describe('restockGood', () => {
    it('should restock a good', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockGood = {
        _id: mockId,
        name: 'Test Good',
        costPrice: 100,
        qty: 15, // After restock
        description: 'Test description',
        minQty: 5,
        productId: 'PROD123'
      };

      GoodModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockGood);

      const result = await GoodDAO.restockGood(mockId, 5);

      expect(GoodModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        { $inc: { qty: 5 } },
        { new: true }
      );
      expect(result).toEqual(mockGood);
    });
  });

  describe('updateGood', () => {
    it('should update a good', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockGood = {
        _id: mockId,
        name: 'Updated Good',
        costPrice: 150,
        qty: 10,
        description: 'Updated description',
        minQty: 5,
        productId: 'PROD123'
      };

      GoodModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockGood);

      const updateData = {
        name: 'Updated Good',
        costPrice: 150,
        description: 'Updated description'
      };

      const result = await GoodDAO.updateGood(mockId, updateData);

      expect(GoodModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        updateData,
        { new: true }
      );
      expect(result).toEqual(mockGood);
    });
  });

  describe('deleteGood', () => {
    it('should delete a good with no active orders', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockGood = {
        _id: mockId,
        name: 'Test Good',
        costPrice: 100,
        qty: 10,
        description: 'Test description',
        minQty: 5,
        productId: 'PROD123'
      };

      const mockOrderItems = [
        { _id: new mongoose.Types.ObjectId() },
        { _id: new mongoose.Types.ObjectId() }
      ];

      OrderItemModel.find = jest.fn().mockResolvedValue(mockOrderItems);
      
      OrderModel.countDocuments = jest.fn().mockResolvedValue(0);
      
      GoodModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockGood);

      const result = await GoodDAO.deleteGood(mockId);

      expect(OrderItemModel.find).toHaveBeenCalledWith({ goodId: mockId });
      expect(OrderModel.countDocuments).toHaveBeenCalledWith({
        status: { $in: ['pending', 'paid', 'error'] },
        _id: { $in: mockOrderItems.map(item => item._id) }
      });
      expect(GoodModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockGood);
    });

    it('should throw IntegrityError if good has active orders', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockOrderItems = [
        { _id: new mongoose.Types.ObjectId() },
        { _id: new mongoose.Types.ObjectId() }
      ];

      OrderItemModel.find = jest.fn().mockResolvedValue(mockOrderItems);
      
      // Return 2 active orders
      OrderModel.countDocuments = jest.fn().mockResolvedValue(2);

      await expect(GoodDAO.deleteGood(mockId)).rejects.toThrow(IntegrityError);
    });

    it('should throw EntityNotFound if good not found', async () => {
      const mockId = new mongoose.Types.ObjectId();
      
      const mockOrderItems = [
        { _id: new mongoose.Types.ObjectId() },
        { _id: new mongoose.Types.ObjectId() }
      ];

      OrderItemModel.find = jest.fn().mockResolvedValue(mockOrderItems);
      
      OrderModel.countDocuments = jest.fn().mockResolvedValue(0);
      
      // Return null to simulate good not found
      GoodModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await expect(GoodDAO.deleteGood(mockId)).rejects.toThrow(EntityNotFound);
    });
  });
}); 