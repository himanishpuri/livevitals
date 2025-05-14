import type { Metadata } from "next"
import DataInputClientPage from "./DataInputClientPage"

export const metadata: Metadata = {
  title: "Data Input | HealthTrack",
  description: "Input your health metrics",
}

export default function DataInput() {
  return <DataInputClientPage />
}
