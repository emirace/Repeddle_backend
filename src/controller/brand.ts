import { Request, Response } from "express";
import Brand, { IBrand } from "../model/brand";
import { CustomRequest } from "../middleware/user";

export const getAllPublishedBrands = async (req: Request, res: Response) => {
  try {
    let { page: initialPage, limit: initialLimit, search } = req.query;

    const page = parseInt(initialPage as string) || 1;
    const limit = parseInt(initialLimit as string) || 20;

    const query: any = { published: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Paginate the products
    const brands: IBrand[] = await Brand.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ status: true, brands });
  } catch (error) {
    console.log("Error fetching published brand", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getAllBrands = async (req: Request, res: Response) => {
  try {
    let { type, sort, page: initialPage, limit: initialLimit } = req.query;

    const page = parseInt(initialPage as string) || 1;
    const limit = parseInt(initialLimit as string) || 20;

    const query: any = {};

    // Validate and apply type filter if available
    if (type) {
      if (type !== "SYSTEM" && type !== "USER") {
        return res
          .status(400)
          .json({ status: false, message: "Invalid type parameter" });
      }
      query.type = type;
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default sort by createdAt in descending order
    if (sort === "published") {
      sortOption = { published: 1 }; // Sort by published in ascending order
    }

    // Paginate the brands
    const brands: IBrand[] = await Brand.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ status: true, brands });
  } catch (error) {
    console.log("Error fetching brands", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getBrandsByAlpha = async (req: Request, res: Response) => {
  try {
    const { alpha } = req.params;
    const { search } = req.query;

    if (!alpha) {
      return res.status(400).json({ error: "Alpha parameter is required." });
    }

    // Create a filter query
    const query: any = { alpha, published: true };

    // If search query exists, add a case-insensitive name filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const brands = await Brand.find(query);

    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addBrand = async (req: CustomRequest, res: Response) => {
  try {
    const { name } = req.body;
    let { published } = req.body;
    let type;

    const brand: IBrand | null = await Brand.findOne({ name });

    if (brand) {
      return res
        .status(400)
        .json({ status: false, message: "Brand with this name already exist" });
    }

    // If user is not an admin, set type to 'USER' and published to false
    if (!req.isAdmin) {
      type = "USER";
      published = false;
    } else {
      // If user is an admin, ensure provided values are used or defaults are set
      type = "SYSTEM";
      published = published !== undefined ? published : true;
    }

    const firstChar = name.charAt(0);
    const alpha = /^[a-zA-Z]/.test(firstChar)
      ? firstChar.toUpperCase()
      : firstChar;

    // Create a new brand instance
    const newBrand: IBrand = new Brand({
      name,
      alpha,
      type,
      published,
    });

    // Save the brand to the database
    const savedBrand: IBrand = await newBrand.save();

    res.status(201).json({ status: true, brand: savedBrand });
  } catch (error) {
    console.log("Error adding brand", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, published } = req.body;

    // Find the brand by id
    const brand: IBrand | null = await Brand.findById(id);

    if (!brand) {
      return res
        .status(404)
        .json({ status: false, message: "Brand not found" });
    }

    // Update brand properties if provided
    if (name) {
      // Generate alpha from the first character of the name
      brand.name = name;
      const firstChar = name.charAt(0);
      brand.alpha = /^[a-zA-Z]/.test(firstChar)
        ? firstChar.toUpperCase()
        : firstChar;
    }

    if (published !== undefined) {
      brand.published = published;
    }

    // Save the updated brand
    const updatedBrand: IBrand = await brand.save();

    res.status(200).json({ status: true, brand: updatedBrand });
  } catch (error) {
    console.log("Error updating brand", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the brand by id and delete it
    const deletedBrand: IBrand | null = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res
        .status(404)
        .json({ status: false, message: "Brand not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.log("Error deleting brand", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
