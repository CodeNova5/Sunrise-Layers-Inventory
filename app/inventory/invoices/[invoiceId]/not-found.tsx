import Link from "next/link";
import Image from "next/image";

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
      <div className="text-center">
        <Image
          src="/images/Oops.png" // Ensure this path matches where you place your image
          alt="Invoice Not Found"
          width={400}
          height={300}
          className="mb-8"
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Invoice Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The invoice you are looking for does not exist.
        </p>
        <Link
          href="/inventory/invoices"
          className="px-6 py-2 text-white bg-pri-4 rounded-sm hover:bg-pri-6 transition"
        >
          Go To Invoices
        </Link>
      </div>
    </div>
  );
}
