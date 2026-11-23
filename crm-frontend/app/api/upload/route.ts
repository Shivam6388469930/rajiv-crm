// // app/api/upload/route.ts
// import { NextRequest } from "next/server";
// import { uploadToCloudinary } from "@/lib/cloudinary";
// import { success, error } from "@/utils/sendResponse";

// export async function POST(req: NextRequest) {
//   try {
//     const contentType = req.headers.get("content-type") || "";

//     // 1. Handling Multipart / Form-Data (file upload directly from browser input)
//     if (contentType.includes("multipart/form-data")) {
//       const formData = await req.formData();
//       const file = formData.get("file") as File | null;

//       if (!file) {
//         return error("No file provided for upload", 400);
//       }

//       // Convert file buffer to base64 data URI
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       const mimeType = file.type || "image/jpeg";
//       const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

//       const uploaded = await uploadToCloudinary(base64Data, "crm-products");
//       return success("Image uploaded successfully", uploaded, 201);
//     }

//     // 2. Handling JSON body (base64 string or image URL)
//     const body = await req.json();

//     if (body.images && Array.isArray(body.images)) {
//       const results = await Promise.all(
//         body.images.map((img: string) => uploadToCloudinary(img, "crm-products"))
//       );
//       return success("Images uploaded successfully", results, 201);
//     }

//     if (!body.image && !body.file) {
//       return error("Image data is required", 400);
//     }

//     const imagePayload = body.image || body.file;
//     const uploaded = await uploadToCloudinary(imagePayload, "crm-products");

//     return success("Image uploaded successfully", uploaded, 201);
//   } catch (err: any) {
//     console.error("Upload error:", err);
//     return error(err.message || "Failed to upload image", 500);
//   }
// }



import { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { success, error } from "@/utils/sendResponse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Multipart upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return error("No valid file provided", 400);
      }

      if (!file.type.startsWith("image/")) {
        return error("Only image files are allowed", 400);
      }

      if (file.size > 5 * 1024 * 1024) {
        return error("Image size must be less than 5MB", 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

      const uploaded = await uploadToCloudinary(
        base64Data,
        "crm-products"
      );

      return success("Image uploaded successfully", uploaded, 201);
    }

    // JSON upload
    const body = await req.json();

    if (body.images && Array.isArray(body.images)) {
      const results = await Promise.all(
        body.images.map((img: string) =>
          uploadToCloudinary(img, "crm-products")
        )
      );

      return success("Images uploaded successfully", results, 201);
    }

    const imagePayload = body.image || body.file;

    if (!imagePayload || typeof imagePayload !== "string") {
      return error("Valid image data is required", 400);
    }

    const uploaded = await uploadToCloudinary(
      imagePayload,
      "crm-products"
    );

    return success("Image uploaded successfully", uploaded, 201);

  } catch (err: any) {
    console.error("Upload API error:", err);

    return error(
      err.message || "Failed to upload image",
      500
    );
  }
}
