"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { employeeExportKeys } from "@/lib/employee-fields";
import {
  exportEmployees,
  getEmployeeDetail,
  persNoSchema,
  updateEmployee,
  updateEmployeeSchema,
  type EmployeeDetail,
  type EmployeeListFilters,
  type EmployeeExportRow,
} from "@/lib/employees";
import { checkRateLimit } from "@/lib/rate-limit";

export type EmployeeActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function formValues(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function revealEmployee(
  persNo: string,
): Promise<{ detail: EmployeeDetail } | { error: string }> {
  const user = await requireUser();

  if (!checkRateLimit(`employee-reveal:${user.id}`, { capacity: 30, refillPerSecond: 0.5 })) {
    return { error: "Too many requests. Please wait a moment and try again." };
  }

  const parsedPersNo = persNoSchema.safeParse(persNo);
  if (!parsedPersNo.success) return { error: "Invalid employee reference." };

  const detail = await getEmployeeDetail(parsedPersNo.data);
  if (!detail) return { error: "Employee record not found." };

  return { detail };
}

export async function saveEmployee(
  persNo: string,
  _state: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const user = await requireUser();

  if (!checkRateLimit(`employee-save:${user.id}`, { capacity: 20, refillPerSecond: 0.2 })) {
    return { message: "Too many update attempts. Please wait a moment and try again." };
  }

  const parsedPersNo = persNoSchema.safeParse(persNo);
  if (!parsedPersNo.success) return { message: "Invalid employee reference." };

  const parsed = updateEmployeeSchema.safeParse(formValues(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    const result = await updateEmployee(parsedPersNo.data, parsed.data, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    if (!result.updated) {
      return {
        message: result.reason === "not_found" ? "Employee record not found." : "No changes were made.",
      };
    }

    return { success: true, message: "Employee record updated." };
  } catch (error) {
    console.error("Employee update failed", error);
    return { message: "The record could not be updated. Please try again." };
  }
}

export async function exportEmployeesCsv(params: {
  search?: string;
  filters?: EmployeeListFilters;
  fields: string[];
}): Promise<{ rows: EmployeeExportRow[] } | { error: string }> {
  const user = await requireUser();

  if (!checkRateLimit(`employee-export:${user.id}`, { capacity: 5, refillPerSecond: 0.05 })) {
    return { error: "Too many export attempts. Please wait a moment and try again." };
  }

  const parsedFields = z.array(z.enum(employeeExportKeys)).min(1).max(employeeExportKeys.length).safeParse(params.fields);
  if (!parsedFields.success || new Set(parsedFields.data).size !== parsedFields.data.length) {
    return { error: "Select at least one valid field to export." };
  }

  try {
    const rows = await exportEmployees(
      { search: params.search, filters: params.filters, fields: parsedFields.data },
      { userId: user.id, email: user.email, role: user.role },
    );
    return { rows };
  } catch (error) {
    console.error("Employee export failed", error);
    return { error: "The export could not be generated. Please try again." };
  }
}
