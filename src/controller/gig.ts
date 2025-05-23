import { Request, Response } from "express";
import { fetchStations } from "../services/gig";

export const getStations = async (req: Request, res: Response) => {
  try {
    const { stations, token } = await fetchStations();

    res.status(200).json({ stations, token });
  } catch (error) {
    // Handle errors
    console.error("Error fetching stations:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};
