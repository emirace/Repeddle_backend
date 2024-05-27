import { Response } from "express";
import Product, { IProduct, ISize } from "../model/product";
import { CustomRequest } from "../middleware/user";
import { generateUniqueSlug } from "../utils/product";
import { ObjectId } from "mongoose";

const allowedFields: (keyof IProduct)[] = [
  "name",
  "images",
  "tags",
  "video",
  "brand",
  "color",
  "mainCategory",
  "category",
  "subCategory",
  "material",
  "description",
  "countInStock",
  "sizes",
  "condition",
  "keyFeatures",
  "specification",
  "overview",
  "sellingPrice",
  "costPrice",
  "meta",
  "vintage",
  "luxury",
  "luxuryImage",
];

const ProductController = {
  // Get products available in the user's region
  async getAllProducts(req: CustomRequest, res: Response) {
    try {
      const userRegion = req.userRegion;
      let {
        page: initialPage,
        limit: initialLimit,
        search,
        filter,
        sort,
      } = req.query;

      const page = parseInt(initialPage as string) || 1;
      const limit = parseInt(initialLimit as string) || 20;

      // Filter by region
      const query: any = { region: userRegion };

      // Apply search filter to all relevant fields
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        query.$or = [
          { name: searchRegex },
          { tags: searchRegex },
          { mainCategory: searchRegex },
          { category: searchRegex },
          { description: searchRegex },
          // Add more fields here as needed
        ];
      }

      // Apply additional filters
      if (filter) {
        // Example: filter=mainCategory:Electronics,category:Smartphones
        const filters = (filter as string).split(",");
        filters.forEach((f: string) => {
          const [key, value] = f.split(":");
          query[key] = value;
        });
      }

      // Sorting
      let sortOption: any = {};
      if (sort) {
        // Example: sort=name:asc
        const [field, order] = (sort as string).split(":");
        sortOption[field] = order === "desc" ? -1 : 1;
      } else {
        // Default sorting
        sortOption.createdAt = -1;
      }

      // Count total documents matching the query
      const totalCount = await Product.countDocuments(query);

      // Paginate the products
      const products = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json({
        status: true,
        data: {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          products,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching products", error });
    }
  },

  async getAllUserProducts(req: CustomRequest, res: Response) {
    try {
      const userRegion = req.userRegion;
      const userId = req.userId;
      let { page: initialPage, limit: initialLimit, search } = req.query;

      const page = parseInt(initialPage as string) || 1;
      const limit = parseInt(initialLimit as string) || 20;
      // Filter by region
      const query: any = { seller: userId, region: userRegion };

      // Apply search filter to all relevant fields
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        query.$or = [
          { name: searchRegex },
          { tags: searchRegex },
          // Add more fields here as needed
        ];
      }

      // Count total documents matching the query
      const totalCount = await Product.countDocuments(query);

      // Paginate the products
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json({
        status: true,
        data: {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          products,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching products", error });
    }
  },

  async getProductBySlug(req: CustomRequest, res: Response) {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ slug }).populate(
        "seller",
        "username image address rating numReviews sold"
      );

      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      // Check if the product is available in the user's region
      const userRegion = req.userRegion;
      if (product.region !== userRegion) {
        return res.status(403).json({
          status: false,
          message: "Product not available in your region",
        });
      }

      res.status(200).json({ status: true, product });
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching product", error });
    }
  },

  async getProductById(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const isAdmin = req.isAdmin;

      const product = await Product.findById(id);

      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      if (product.seller.toString() !== userId.toString() && !isAdmin) {
        return res.status(403).json({
          status: false,
          message: "You are not authorized to access this resource.",
        });
      }

      res.status(200).json({ status: true, product });
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching product", error });
    }
  },

  async createProduct(req: CustomRequest, res: Response) {
    try {
      const newProductData: Partial<IProduct> = {};

      // Automatically add region from middleware
      newProductData.region = req.userRegion;
      newProductData.seller = req.userId as unknown as ObjectId;

      // Automatically generate slug from product name
      newProductData.slug = await generateUniqueSlug(req.body.name);

      if (req.body.sizes?.length > 0) {
        // Calculate countInStock from total size quantity
        const countInStock = req.body.sizes.reduce(
          (total: number, size: ISize) => total + size.quantity,
          0
        );
        newProductData.countInStock = countInStock;
      } else if (req.body.countInStock) {
        newProductData.countInStock = req.body.countInStock;
      } else {
        res.status(400).json({
          status: false,
          message: "Either sizes or countInstock is required",
        });
      }

      // Populate newProductData with allowed fields from the request body
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          newProductData[field] = req.body[field];
        }
      });

      const newProduct = await Product.create(newProductData as IProduct);
      res.status(201).json({ status: true, product: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res
        .status(500)
        .json({ status: false, message: "Error creating product", error });
    }
  },

  async updateProduct(req: CustomRequest, res: Response) {
    try {
      const productId = req.params.productId;
      const userId = req.userId; // Assuming user ID is available in the request

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      // Check if the user is an admin
      if (!req.isAdmin) {
        // If not an admin, check if the user is the seller of the product

        if (product.seller.toString() !== userId) {
          return res
            .status(403)
            .json({ status: false, message: "Unauthorized" });
        }
      }

      const updatedProductData: Partial<IProduct> = {};

      // Automatically generate slug from product name if name is updated
      if (req.body.name) {
        updatedProductData.slug = await generateUniqueSlug(req.body.name);
      }

      // Calculate countInStock from total size quantity if sizes are updated
      if (req.body.sizes) {
        const countInStock = req.body.sizes.reduce(
          (total: number, size: ISize) => total + size.quantity,
          0
        );
        updatedProductData.countInStock = countInStock;
      }

      // Keep history of changes for sellingPrice and costPrice
      if (req.body.sellingPrice !== undefined) {
        updatedProductData.sellingPriceHistory =
          product.sellingPriceHistory || [];
        updatedProductData.sellingPriceHistory.push({
          value: product.sellingPrice,
          updatedAt: new Date(),
        });
      }

      if (req.body.costPrice !== undefined) {
        updatedProductData.costPriceHistory = product.costPriceHistory || [];
        updatedProductData.costPriceHistory.push({
          value: product.costPrice,
          updatedAt: new Date(),
        });
      }

      // Populate updatedProductData with allowed fields from the request body
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updatedProductData[field] = req.body[field];
        }
      });

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedProductData,
        { new: true }
      );
      if (!updatedProduct) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }
      res.status(200).json({ status: true, product: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res
        .status(500)
        .json({ status: false, message: "Error updating product", error });
    }
  },

  async deleteProduct(req: CustomRequest, res: Response) {
    try {
      const productId = req.params.productId;
      const userId = req.userId; // Assuming you have middleware to extract user ID from token or session

      // Find the product by ID
      const product = await Product.findById(productId);

      // If the product doesn't exist
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      // Check if the user is the seller of the product or an admin
      if (product.seller.toString() !== userId && !req.isAdmin) {
        return res.status(403).json({ status: false, message: "Unauthorized" });
      }

      // Delete the product
      await Product.findByIdAndDelete(productId);

      return res
        .status(200)
        .json({ status: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res
        .status(500)
        .json({ status: false, message: "Error deleting product", error });
    }
  },

  async getUserProductSummary(req: CustomRequest, res: Response) {
    try {
      const userId = req.userId;
      const { startDate, endDate } = req.query;

      // Set default values for startDate and endDate if not provided
      const parsedStartDate = startDate
        ? new Date(startDate as string)
        : new Date();
      const parsedEndDate = endDate ? new Date(endDate as string) : new Date();

      // Validate date parsing
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid date format" });
      }

      // Aggregate products based on the day of creation within the specified time frame
      const dailyProducts = await Product.aggregate([
        {
          $match: {
            seller: userId,
            createdAt: { $gte: parsedStartDate, $lte: parsedEndDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            products: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const totalProduct = dailyProducts.reduce(
        (acc, product) => acc + product.products,
        0
      );

      res.status(200).json({
        status: true,
        data: {
          dailyProducts,
          totalProduct,
        },
      });
    } catch (error) {
      console.error("Error getting product summary:", error);
      return res
        .status(500)
        .json({ status: false, message: "Error getting product summary" });
    }
  },
};

export default ProductController;
