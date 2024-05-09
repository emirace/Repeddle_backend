import { Request, Response } from "express";
import ContactUs, { IContactUs } from "../model/contactUs";
import { CustomRequest } from "../middleware/user";

export const addContactUs = async (req: Request, res: Response) => {
  try {
    const { name, email, category, subject, message, file } = req.body;

    // Create a new ContactUs instance
    const newContactUs: IContactUs = new ContactUs({
      name,
      email,
      category,
      subject,
      message,
      file,
    });

    // Save the contact us request to the database
    const savedContactUs: IContactUs = await newContactUs.save();

    res.status(201).json({ status: true, contactUs: savedContactUs });
  } catch (error) {
    console.log("Error adding contact us request", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getAllContactUs = async (req: Request, res: Response) => {
  try {
    // Fetch all contact us requests from the database
    const contactUsRequests: IContactUs[] = await ContactUs.find();

    res.status(200).json({ status: true, contactUsRequests });
  } catch (error) {
    console.log("Error fetching contact us requests", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const assignContactToUser = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { contactId } = req.params;
    const userId = req.userId!;

    // Find the contact us request by ID
    const contactUsRequest: IContactUs | null = await ContactUs.findById(
      contactId
    );

    if (!contactUsRequest) {
      return res
        .status(404)
        .json({ status: false, message: "Contact us request not found" });
    }

    // Assign the contact to the user
    contactUsRequest.assignTo = userId;
    await contactUsRequest.save();

    res
      .status(200)
      .json({ status: true, message: "Contact assigned to user successfully" });
  } catch (error) {
    console.log("Error assigning contact to user", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the contact us request by id and delete it
    const deletedContact: IContactUs | null = await ContactUs.findByIdAndDelete(
      id
    );

    if (!deletedContact) {
      return res
        .status(404)
        .json({ status: false, message: "Contact us request not found" });
    }

    res
      .status(200)
      .json({
        status: true,
        message: "Contact us request deleted successfully",
      });
  } catch (error) {
    console.log("Error deleting contact us request", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
