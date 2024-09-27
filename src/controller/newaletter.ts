import { Request, Response } from "express";
import Newsletter, { INewsletter } from "../model/newsletter";
import { CustomRequest } from "../middleware/user";
import User from "../model/user";

export const getAllNewsletters = async (req: Request, res: Response) => {
  try {
    let { search } = req.query;
    const query: any = {};

    if (search) {
      // Case-insensitive search by email
      query.email = { $regex: search.toString(), $options: "i" };
    }

    // Fetch all newsletters matching the query
    const newsletters: INewsletter[] = await Newsletter.find(query);

    res.status(200).json({ status: true, newsletters });
  } catch (error) {
    console.log("Error fetching newsletters", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const createNewsletter = async (req: CustomRequest, res: Response) => {
  try {
    const userRegion = req.userRegion;
    const { email } = req.body;
    const url = userRegion === "ZAR" ? "co.za" : "com";

    // Check if a newsletter with the same email already exists
    const existingNewsletter = await Newsletter.findOne({ email });

    if (existingNewsletter) {
      return res
        .status(201)
        .json({ status: true, newsletter: existingNewsletter });
    }

    // Create a new Newsletter instance
    const newNewsletter: INewsletter = new Newsletter({
      email,
      url,
    });

    // Save the newsletter to the database
    const savedNewsletter: INewsletter = await newNewsletter.save();
    const user = await User.findOne({ email });
    if (user) {
      user.allowNewsletter = true;
      await user.save();
    }

    res.status(201).json({ status: true, newsletter: savedNewsletter });
  } catch (error) {
    console.log("Error creating newsletter", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteUserNewsletter = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Find all newsletters with the same email
    const newsletters = await Newsletter.find({ email: user.email });

    if (!newsletters || newsletters.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Newsletter not found" });
    }

    // Keep one and delete the duplicates
    const [newsletterToKeep, ...duplicates] = newsletters;

    // Delete all duplicates from the database
    await Newsletter.deleteMany({
      _id: { $in: duplicates.map((newsletter) => newsletter._id) },
    });

    // Find the newsletter by id and update the 'deleted' field
    const updatedNewsletter: INewsletter | null =
      await Newsletter.findByIdAndUpdate(
        newsletterToKeep._id,
        { $set: { isDeleted: true } },
        { new: true }
      );

    if (!updatedNewsletter) {
      return res
        .status(404)
        .json({ status: false, message: "Newsletter not found" });
    }
    user.allowNewsletter = false;
    await user.save();

    res
      .status(200)
      .json({ status: true, message: "Newsletter deleted successfully" });
  } catch (error) {
    console.log("Error deleting newsletter", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteNewsletter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the newsletter by id and update the 'deleted' field
    const updatedNewsletter: INewsletter | null =
      await Newsletter.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { new: true }
      );

    if (!updatedNewsletter) {
      return res
        .status(404)
        .json({ status: false, message: "Newsletter not found" });
    }

    const user = await User.findOne({ email: updatedNewsletter.email });
    if (user) {
      user.allowNewsletter = false;
      await user.save();
    }

    res
      .status(200)
      .json({ status: true, message: "Newsletter deleted successfully" });
  } catch (error) {
    console.log("Error deleting newsletter", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
