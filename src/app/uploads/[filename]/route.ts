import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  let filePath = "";
  try {
    const { filename } = await params;
    
    filePath = path.join(process.cwd(), "public", "uploads", filename);
    
    const fileBuffer = await fs.readFile(filePath);
    
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".pdf") contentType = "application/pdf";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error: any) {
    return new NextResponse(`File not found: ${filePath} - Error: ${error.message} - CWD: ${process.cwd()}`, { status: 404 });
  }
}
