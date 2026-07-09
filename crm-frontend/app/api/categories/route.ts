import { NextRequest } from "next/server";

import connectDB from "@/lib/db";
import {
    createCategory,
    getCategories,
} from "@/services/category.service";

import { success, error } from "@/utils/sendResponse";

import { validateCategory } from "@/validation/category.validation";

export async function GET() {

    try {

        await connectDB();

        const categories =
            await getCategories();

        return success(
            "Categories fetched",
            categories
        );

    } catch (err: any) {

        return error(err.message);

    }

}

export async function POST(
    req: NextRequest
) {

    try {

        await connectDB();

        const body = await req.json();

        const validation =
            validateCategory(body);

        if (validation)
            return error(validation);

        const category =
            await createCategory(body);

        return success(
            "Category Created",
            category,
            201
        );

    } catch (err: any) {

        return error(err.message);

    }

}