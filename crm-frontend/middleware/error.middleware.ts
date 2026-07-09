import { NextResponse } from "next/server";

export const handleError = (error: any) => {
  return NextResponse.json(
    {
      success: false,
      message: error.message || "Internal Server Error",
    },
    {
      status: 500,
    }
  );
};