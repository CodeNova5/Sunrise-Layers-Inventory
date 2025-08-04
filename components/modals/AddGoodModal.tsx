"use client";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import React, { FC } from "react";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreatableSelect from "react-select/creatable";
import { useGoodStore } from "@/lib/providers/good-store-provider";
import { GoodCreate } from "@/lib/stores/good-store";
import Modal from "../ui/modal";

type FormData = {
  name: string;
  description: string;
  productCode: string;
  unitPrice: number;
  categories: readonly string[];
  qtyInStock: number;
  minQtyThreshold: number;
};

function validateName({ name }: FormData) {
  if (!name.trim()) {
    toast.error("Name is required", { toastId: "name-required" });
    return false;
  }
  if (name.length < 3) {
    toast.error("Name is too short", { toastId: "name-invalid" });
    return false;
  }
  return true;
}

function validateDescription({ description }: FormData) {
  if (!description.trim()) {
    toast.error("Description is required", {
      toastId: "description-required",
    });
    return false;
  }
  return true;
}

function validateProductId({ productCode }: FormData) {
  if (!productCode.trim()) {
    toast.error("Product ID is required", {
      toastId: "productId-required",
    });
    return false;
  }
  return true;
}

function validateCostPrice({ unitPrice }: FormData) {
  if (unitPrice <= 0) {
    toast.error("Cost price must be greater than 0", {
      toastId: "costPrice-required",
    });
    return false;
  }
  return true;
}

function validateQtyInStock({ qtyInStock }: FormData) {
  if (qtyInStock <= 0) {
    toast.error("Quantity in stock must be greater than 0", {
      toastId: "qtyInStock-required",
    });
    return false;
  }
  return true;
}

function validateMinQtyThreshold({ minQtyThreshold }: FormData) {
  if (minQtyThreshold <= 0) {
    toast.error("Minimum quantity threshold must be greater than 0", {
      toastId: "minQtyThreshold-required",
    });
    return false;
  }
  return true;
}

function validateCategory({ categories }: FormData) {
  if (categories.length === 0) {
    toast.error("Category is required", { toastId: "category-required" });
    return false;
  }
  return true;
}

function validateForm(data: FormData) {
  return (
    validateName(data) &&
    validateDescription(data) &&
    validateProductId(data) &&
    validateCostPrice(data) &&
    validateQtyInStock(data) &&
    validateMinQtyThreshold(data) &&
    validateCategory(data)
  );
}

function getPayload(data: FormData): GoodCreate {
  return {
    name: data.name,
    description: data.description,
    productId: data.productCode,
    costPrice: data.unitPrice,
    qty: data.qtyInStock,
    minQty: data.minQtyThreshold,
    categories: data.categories.slice(),
  };
}

interface AddGoodProps {}

const AddGoodModal: FC<AddGoodProps> = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [productCode, setProductCode] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [qtyInStock, setQtyInStock] = useState<number>(0);
  const [minQtyThreshold, setminQtyThreshold] = useState<number>(0);
  const [categories, setCategories] = useState<
    readonly { value: string; label: string }[]
  >([]);
  const { allCategories, createGood } = useGoodStore((state) => state);
  const closeModal = () => {
    clearForm();
  };

  function clearForm() {
    setName("");
    setDescription("");
    setProductCode("");
    setUnitPrice(0);
    setQtyInStock(0);
    setminQtyThreshold(0);
    setCategories([]);
    setStatus("idle");
  }

  function handleUpdateGood() {
    const data: FormData = {
      name,
      description,
      productCode,
      unitPrice,
      qtyInStock,
      minQtyThreshold,
      categories: categories.map((category) => category.value),
    };
    const payload = getPayload(data);
    if (validateForm(data)) {
      setStatus("saving");
      createGood(payload).then(() => {
        setStatus("idle");
        toast.success("Product Created!", {
          toastId: "good-created",
        });
        closeModal();
      });
    }
  }

  return (
    <Modal
      id="actions/product/add-new"
      onClose={closeModal}
      title="Add Product"
      classNames={{ content: "w-full" }}
    >
      <form className="space-y-4" action="#">
        <div>
          <label
            htmlFor="productName"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Product Name
          </label>
          <Input
            type="text"
            name="productName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Description
          </label>
          <Input
            type="text"
            disabled={status !== "idle"}
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="productId"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Product Id
          </label>
          <Input
            type="text"
            disabled={status !== "idle"}
            name="productId"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="costPrice"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Cost Price
          </label>
          <Input
            type="number"
            disabled={status !== "idle"}
            name="costPrice"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number.parseInt(e.target.value))}
          />
        </div>
        <div>
          <label
            htmlFor="qty"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Quantity in Stock
          </label>
          <Input
            type="number"
            disabled={status !== "idle"}
            name="qty"
            value={qtyInStock}
            onChange={(e) => setQtyInStock(Number.parseInt(e.target.value))}
          />
        </div>
        <div>
          <label
            htmlFor="threshold"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Quantity Threshold
          </label>
          <Input
            type="number"
            disabled={status !== "idle"}
            name="threshold"
            value={minQtyThreshold}
            onChange={(e) =>
              setminQtyThreshold(Number.parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <label
            htmlFor="group"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Categories
          </label>
          <CreatableSelect
            isMulti
            isClearable
            isDisabled={status !== "idle"}
            name="categories"
            value={categories}
            options={allCategories.map((category) => ({
              value: category,
              label: category,
            }))}
            className="text-black bg-white"
            classNamePrefix="category-select"
            onChange={(selectedCategories) => setCategories(selectedCategories ?? [])}
          />
        </div>
        <Button
          className="w-full bg-[#FFE082] hover:bg-[#FFECB3] text-black font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
          type="submit"
          disabled={status !== "idle"}
          onClick={(e) => {
            e.preventDefault();
            handleUpdateGood();
          }}
        >
          {status === "saving" ? (
            <>
              <CgSpinner className="animate-spin inline-block" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            "Save"
          )}
        </Button>
      </form>
    </Modal>
  );
};

export default AddGoodModal;
