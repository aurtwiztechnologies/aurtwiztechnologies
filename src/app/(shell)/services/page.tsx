import React from "react";
import { getServices } from "@/lib/actions/services";
import { ServicesClient } from "./services-client";

export const metadata = {
  title: "Services Catalog | Aurtwiz Business OS",
  description: "Comprehensive directory of the 31 standardized service offerings across Aurtwiz Technologies' 7 business divisions.",
};

export default async function ServicesPage() {
  const dbServices = await getServices();

  return <ServicesClient dbServices={dbServices} />;
}
