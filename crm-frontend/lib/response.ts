import { NextResponse } from "next/server";

export const successResponse = (
  message: string,
  data: any = null,
  status = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

export const errorResponse = (
  message: string,
  status = 400
) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};