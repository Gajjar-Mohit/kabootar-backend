import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  deleteUserService,
  registerUserService,
} from "@/db/services/user.service";

export async function POST(req: Request) {
  console.log("Webhook received:", req.body);
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("No secret found", {
      status: 500,
    });
  }

  const webhook = new Webhook(secret);
  const data = await headers();
  const svix_id = data.get("svix-id");
  const svix_timestamp = data.get("svix-timestamp");
  const svix_signature = data.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  let evt: WebhookEvent;

  try {
    evt = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    if (evt.type == "user.created") {
      try {
        const res = await registerUserService({
          name: evt.data.first_name + " " + evt.data.last_name,
          email: evt.data.email_addresses[0].email_address,
          role: "USER",
          imageUrl: evt.data.image_url,
          clerkId: evt.data.id,
        });
        console.log(res);
      } catch (error) {
        console.log(error);
        return new NextResponse("Error creating user", {
          status: 500,
        });
      }
    }

    if (evt.type == "user.deleted") {
      try {
        const res = await deleteUserService(evt.data.id || "");
        console.log(res);
      } catch (error) {
        console.log(error);
        return new NextResponse("Error deleting user", {
          status: 500,
        });
      }
    }

    if (evt.type == "user.updated") {
      // Handle user update logic here if needed
    }

    // Return success response for all webhook events
    return new NextResponse("Webhook processed successfully", {
      status: 200,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occured", {
      status: 400,
    });
  }
}
