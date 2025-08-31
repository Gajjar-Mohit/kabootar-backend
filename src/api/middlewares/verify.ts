// package.json dependencies:
// {
//   "dependencies": {
//     "express": "^4.18.2",
//     "ethers": "^6.8.0",
//     "cors": "^2.8.5"
//   },
//   "devDependencies": {
//     "@types/express": "^4.17.17",
//     "@types/cors": "^2.8.13",
//     "typescript": "^5.0.0",
//     "ts-node": "^10.9.0"
//   }
// }

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { ethers } from "ethers";

// Types
interface SignatureVerificationRequest {
  message: string;
  signature: string;
  address: string;
}

interface AuthRequest {
  message: string;
  signature: string;
  address: string;
  timestamp?: number;
}

interface VerificationResult {
  isValid: boolean;
  recoveredAddress?: string;
  error?: string;
}

// Utility class for signature operations
class SignatureService {
  /**
   * Verify a signature against a message and expected address
   */
  static async verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<VerificationResult> {
    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      // Compare addresses (case-insensitive)
      const isValid =
        recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

      return {
        isValid,
        recoveredAddress: recoveredAddress.toLowerCase(),
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify a signature with timestamp to prevent replay attacks
   */
  static async verifyTimestampedSignature(
    message: string,
    signature: string,
    expectedAddress: string,
    timestamp: number,
    maxAgeMinutes: number = 5
  ): Promise<VerificationResult> {
    try {
      // Check if timestamp is within acceptable range
      const now = Date.now();
      const messageTime = timestamp * 1000; // Convert to milliseconds
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

      if (now - messageTime > maxAge) {
        return {
          isValid: false,
          error: "Message timestamp is too old",
        };
      }

      if (messageTime > now + 60000) {
        // Allow 1 minute clock skew
        return {
          isValid: false,
          error: "Message timestamp is in the future",
        };
      }

      // Verify the signature
      return await this.verifySignature(message, signature, expectedAddress);
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate a challenge message for authentication
   */
  static generateAuthMessage(
    address: string,
    nonce: string,
    timestamp?: number
  ): string {
    const ts = timestamp || Math.floor(Date.now() / 1000);
    return `Please sign this message to authenticate your wallet.

Address: ${address}
Nonce: ${nonce}
Timestamp: ${ts}

This signature will be used to verify your identity.`;
  }
}

// Middleware for request validation
const validateSignatureRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { message, signature, address } = req.body;

  if (!message || !signature || !address) {
    res.status(400).json({
      error:
        "Missing required fields: message, signature, and address are required",
    });
    return;
  }

  if (
    typeof message !== "string" ||
    typeof signature !== "string" ||
    typeof address !== "string"
  ) {
    res.status(400).json({
      error:
        "Invalid field types: message, signature, and address must be strings",
    });
    return;
  }

  // Validate Ethereum address format
  if (!ethers.isAddress(address)) {
    res.status(400).json({
      error: "Invalid Ethereum address format",
    });
    return;
  }

  next();
};
