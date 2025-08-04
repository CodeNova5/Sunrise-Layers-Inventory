import mongoose from 'mongoose';
import OrderDAO from '@/lib/inventory/dao/order';
import { OrderModel } from '@/lib/inventory/models/order';
import OrderItemDAO from '@/lib/inventory/dao/orderItem';
import OrderPaymentDAO from '@/lib/inventory/dao/orderPayment';
import { EntityNotFound, IntegrityError, PageNotFound, ValueError } from '@/lib/errors';

// Mock dependencies
jest.mock('@/lib/inventory/dao/orderItem', () => ({
  addOrderItem: jest.fn(),
  updateOrderItem: jest.fn(),
  getOrderItems: jest.fn()
}));

jest.mock('@/lib/inventory/dao/orderPayment', () => ({
  createOrderPayment: jest.fn()
}));

describe('OrderDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addOrder', () => {
    it('should add a new order successfully', async () => {
      const orderId = new mongoose.Types.ObjectId();
      const buyerId = new mongoose.Types.ObjectId();
      const staffId = new mongoose.Types.ObjectId();

      const mockOrder = {
        _id: orderId,
        status: 'pending',
        orderNo: 'ORD123',
        discount: 10,
        amountPaid: 0,
        cancelReason: '',
        createdAt: new Date(),
        overdueLimit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        buyerId,
        populate: jest.fn().mockReturnThis()
      };

      // Mock OrderModel.create
      OrderModel.create = jest.fn().mockResolvedValue(mockOrder);

      // Mock OrderItemDAO.addOrderItem
      const mockItems = [
        {
          id: new mongoose.Types.ObjectId().toString(),
          name: 'Item 1',
          qty: 2,
          costPrice: 50,
          sellingPrice: 80,
          goodId: new mongoose.Types.ObjectId().toString()
        },
        {
          id: new mongoose.Types.ObjectId().toString(),
          name: 'Item 2',
          qty: 1,
          costPrice: 100,
          sellingPrice: 150,
          goodId: new mongoose.Types.ObjectId().toString()
        }
      ];
      
      (OrderItemDAO.addOrderItem as jest.Mock).mockImplementation((orderId, goodId, item) => {
        return Promise.resolve({
          ...item,
          id: new mongoose.Types.ObjectId().toString(),
          orderId,
          goodId
        });
      });

      // Mock the populated buyer
      mockOrder.buyerId = {
        _id: buyerId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2341234567890'
      };

      const orderData = {
        status: 'pending',
        orderNo: 'ORD123',
        discount: 10,
        amountPaid: 0,
        createdAt: new Date().toISOString(),
        overdueLimit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        buyerId: buyerId.toString(),
        staff: staffId.toString(),
        items: [
          {
            name: 'Item 1',
            qty: 2,
            costPrice: 50,
            sellingPrice: 80,
            goodId: new mongoose.Types.ObjectId().toString()
          },
          {
            name: 'Item 2',
            qty: 1,
            costPrice: 100,
            sellingPrice: 150,
            goodId: new mongoose.Types.ObjectId().toString()
          }
        ],
        payments: [
          {
            amount: 100,
            method: 'cash',
            reference: 'REF123'
          }
        ]
      };

      const result = await OrderDAO.addOrder(orderData);

      expect(OrderModel.create).toHaveBeenCalled();
      expect(OrderItemDAO.addOrderItem).toHaveBeenCalledTimes(2);
      expect(OrderPaymentDAO.createOrderPayment).toHaveBeenCalledTimes(1);
      
      expect(result).toHaveProperty('id', orderId.toString());
      expect(result).toHaveProperty('orderNo', 'ORD123');
      expect(result).toHaveProperty('buyer');
      expect(result.buyer).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBe(2);
    });
  });

  describe('updateOrder', () => {
    it('should update an order successfully', async () => {
      const orderId = new mongoose.Types.ObjectId();
      const buyerId = new mongoose.Types.ObjectId();

      const mockOrder = {
        _id: orderId,
        status: 'pending',
        orderNo: 'ORD123',
        discount: 15, // Updated
        amountPaid: 0,
        cancelReason: '',
        createdAt: new Date(),
        overdueLimit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        buyerId,
        populate: jest.fn().mockReturnThis()
      };

      // Mock OrderModel.findByIdAndUpdate
      OrderModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      // Mock items
      const existingItemId = new mongoose.Types.ObjectId();
      const newGoodId = new mongoose.Types.ObjectId();
      
      const mockItems = [
        {
          id: existingItemId.toString(),
          name: 'Updated Item',
          qty: 3,
          costPrice: 50,
          sellingPrice: 90,
          goodId: new mongoose.Types.ObjectId().toString()
        },
        {
          name: 'New Item',
          qty: 1,
          costPrice: 200,
          sellingPrice: 250,
          goodId: newGoodId.toString()
        }
      ];

      // Mock update/add item methods
      (OrderItemDAO.updateOrderItem as jest.Mock).mockResolvedValue(mockItems[0]);
      (OrderItemDAO.addOrderItem as jest.Mock).mockResolvedValue({
        ...mockItems[1],
        id: new mongoose.Types.ObjectId().toString()
      });

      // Mock the populated buyer
      mockOrder.buyerId = {
        _id: buyerId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2341234567890'
      };

      const updateData = {
        id: orderId.toString(),
        discount: 15,
        buyerId: buyerId.toString(),
        items: mockItems
      };

      const result = await OrderDAO.updateOrder(updateData);

      expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId.toString(),
        expect.objectContaining({
          discount: 15,
          buyerId: expect.any(mongoose.Types.ObjectId)
        }),
        { new: true }
      );
      
      expect(OrderItemDAO.updateOrderItem).toHaveBeenCalledWith(
        existingItemId.toString(),
        mockItems[0]
      );
      
      expect(OrderItemDAO.addOrderItem).toHaveBeenCalledWith(
        orderId,
        newGoodId,
        mockItems[1]
      );

      expect(result).toHaveProperty('id', orderId.toString());
      expect(result).toHaveProperty('discount', 15);
      expect(result).toHaveProperty('buyer');
      expect(result.buyer).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBe(2);
    });

    it('should throw EntityNotFound if order not found', async () => {
      // Mock OrderModel.findByIdAndUpdate to return null
      OrderModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const updateData = {
        id: new mongoose.Types.ObjectId().toString(),
        discount: 15,
        buyerId: new mongoose.Types.ObjectId().toString(),
        items: []
      };

      await expect(OrderDAO.updateOrder(updateData)).rejects.toThrow(EntityNotFound);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order with status "cancelled"', async () => {
      const orderId = new mongoose.Types.ObjectId();
      
      const mockOrder = {
        _id: orderId,
        status: 'cancelled',
        orderNo: 'ORD123',
        deleteOne: jest.fn().mockResolvedValue(undefined)
      };

      OrderModel.findById = jest.fn().mockResolvedValue(mockOrder);

      const result = await OrderDAO.deleteOrder(orderId);

      expect(OrderModel.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrder.deleteOne).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw IntegrityError if order has active transaction', async () => {
      const orderId = new mongoose.Types.ObjectId();
      
      const mockOrder = {
        _id: orderId,
        status: 'pending',
        orderNo: 'ORD123',
        deleteOne: jest.fn()
      };

      OrderModel.findById = jest.fn().mockResolvedValue(mockOrder);

      await expect(OrderDAO.deleteOrder(orderId)).rejects.toThrow(IntegrityError);
      expect(mockOrder.deleteOne).not.toHaveBeenCalled();
    });

    it('should throw EntityNotFound if order not found', async () => {
      const orderId = new mongoose.Types.ObjectId();
      
      OrderModel.findById = jest.fn().mockResolvedValue(null);

      await expect(OrderDAO.deleteOrder(orderId)).rejects.toThrow(EntityNotFound);
    });
  });

  describe('getOrder', () => {
    it('should get an order by id', async () => {
      const orderId = new mongoose.Types.ObjectId();
      const buyerId = new mongoose.Types.ObjectId();
      
      const mockOrder = {
        _id: orderId,
        status: 'pending',
        orderNo: 'ORD123',
        discount: 10,
        amountPaid: 0,
        cancelReason: '',
        createdAt: new Date(),
        overdueLimit: new Date(),
        buyerId: {
          _id: buyerId,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2341234567890'
        }
      };

      OrderModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockOrder)
      });

      const mockItems = [
        {
          id: new mongoose.Types.ObjectId().toString(),
          name: 'Item 1',
          qty: 2,
          costPrice: 50,
          sellingPrice: 80,
          goodId: new mongoose.Types.ObjectId().toString()
        }
      ];

      (OrderItemDAO.getOrderItems as jest.Mock).mockResolvedValue(mockItems);

      const result = await OrderDAO.getOrder(orderId);

      expect(OrderModel.findOne).toHaveBeenCalledWith({ _id: orderId });
      expect(OrderItemDAO.getOrderItems).toHaveBeenCalledWith(orderId);
      
      expect(result).toHaveProperty('id', orderId.toString());
      expect(result).toHaveProperty('orderNo', 'ORD123');
      expect(result).toHaveProperty('buyer');
      expect(result.buyer).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('items');
      expect(result.items).toEqual(mockItems);
    });

    it('should throw ValueError if no id or filters provided', async () => {
      await expect(OrderDAO.getOrder()).rejects.toThrow(ValueError);
    });

    it('should throw EntityNotFound if order not found', async () => {
      const orderId = new mongoose.Types.ObjectId();
      
      OrderModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(OrderDAO.getOrder(orderId)).rejects.toThrow(EntityNotFound);
    });
  });

  describe('getOrders', () => {
    it('should get paginated orders', async () => {
      // Mock necessary functions
      const countDocumentsMock = jest.fn().mockResolvedValue(20);
      OrderModel.countDocuments = jest.fn().mockReturnValue({
        exec: countDocumentsMock
      });

      const mockOrders = [
        {
          _id: new mongoose.Types.ObjectId(),
          status: 'pending',
          orderNo: 'ORD123',
          discount: 10,
          amountPaid: 0,
          cancelReason: '',
          createdAt: new Date(),
          overdueLimit: new Date(),
          buyerId: {
            _id: new mongoose.Types.ObjectId(),
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+2341234567890'
          }
        },
        {
          _id: new mongoose.Types.ObjectId(),
          status: 'paid',
          orderNo: 'ORD124',
          discount: 0,
          amountPaid: 300,
          cancelReason: '',
          createdAt: new Date(),
          overdueLimit: new Date(),
          buyerId: {
            _id: new mongoose.Types.ObjectId(),
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+2341234567891'
          }
        }
      ];

      OrderModel.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders)
      });

      // Mock OrderItemDAO.getOrderItems
      (OrderItemDAO.getOrderItems as jest.Mock).mockImplementation((orderId) => {
        if (orderId.equals(mockOrders[0]._id)) {
          return Promise.resolve([
            {
              id: new mongoose.Types.ObjectId().toString(),
              name: 'Item 1',
              qty: 2,
              costPrice: 50,
              sellingPrice: 80,
              goodId: new mongoose.Types.ObjectId().toString()
            }
          ]);
        } else {
          return Promise.resolve([
            {
              id: new mongoose.Types.ObjectId().toString(),
              name: 'Item 2',
              qty: 1,
              costPrice: 200,
              sellingPrice: 300,
              goodId: new mongoose.Types.ObjectId().toString()
            }
          ]);
        }
      });

      const result = await OrderDAO.getOrders({
        filters: { status: 'pending' },
        page: 1,
        limit: 10,
        sort: { createdAt: -1 }
      });

      expect(OrderModel.countDocuments).toHaveBeenCalledWith({ status: 'pending' });
      expect(OrderModel.find).toHaveBeenCalledWith({ status: 'pending' });
      
      expect(result.totalDocs).toBe(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.pageCount).toBe(2);
      expect(result.orders).toHaveLength(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.next).toBe(2);
      
      // Check that orders are summarized (have totalCost, totalAmount, etc.)
      expect(result.orders[0]).toHaveProperty('totalCost');
      expect(result.orders[0]).toHaveProperty('totalAmount');
      expect(result.orders[0]).toHaveProperty('numItems');
      expect(result.orders[0]).not.toHaveProperty('items'); // Items should be removed in summary
    });

    it('should throw PageNotFound if page is less than 1', async () => {
      await expect(OrderDAO.getOrders({
        filters: {},
        page: 0,
        limit: 10,
        sort: { createdAt: -1 }
      })).rejects.toThrow(PageNotFound);
    });
  });
});