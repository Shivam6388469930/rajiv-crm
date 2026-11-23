// // lib/cloudinary.ts
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
//   api_key: process.env.CLOUDINARY_API_KEY || "",
//   api_secret: process.env.CLOUDINARY_API_SECRET || "",
//   secure: true,
// });

// export async function uploadToCloudinary(
//   fileBase64OrUrl: string,
//   folder = "crm-products"
// ): Promise<{ url: string; public_id: string }> {
//   // If Cloudinary credentials are provided, perform real upload
//   if (
//     process.env.CLOUDINARY_CLOUD_NAME &&
//     process.env.CLOUDINARY_API_KEY &&
//     process.env.CLOUDINARY_API_SECRET
//   ) {
//     try {
//       const result = await cloudinary.uploader.upload(fileBase64OrUrl, {
//         folder,
//         resource_type: "auto",
//       });
//       return {
//         url: result.secure_url || result.url,
//         public_id: result.public_id,
//       };
//     } catch (err: any) {
//       console.error("Cloudinary upload failed:", err);
//       throw new Error(err.message || "Cloudinary upload failed");
//     }
//   }

//   // Graceful fallback if Cloudinary credentials are not configured yet in .env:
//   // Return the base64 or external URL directly so development and testing continue smoothly
//   return {
//     url: fileBase64OrUrl,
//     public_id: `local_${Date.now()}`,
//   };
// }

// export default cloudinary;



import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  file: string,
  folder: string = "crm-products"
) {
  try {
    // Validate Cloudinary credentials
    const { cloud_name, api_key, api_secret } =
      cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error(
        "Cloudinary environment variables are missing"
      );
    }

    if (!file) {
      throw new Error("No image data provided");
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (err: any) {
    console.error("Cloudinary upload failed:", {
      message: err.message,
      http_code: err.http_code,
      name: err.name,
      cloudinaryError: err.error,
    });

    throw new Error(
      err.error?.message ||
      err.message ||
      "Cloudinary upload failed"
    );
  }
}
