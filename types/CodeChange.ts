interface CodeProduct {
  id: number,
  exhibitionName: string,
  image: string,
  description: string,
  information1: string,
  information2: string,
  videoUrl: string,
  waveSide: "Left" | "Right",
  waveLevel: "Bay" | "Reef",
  waveLevelAcceptBay: boolean,
  productType: CodeProductType,
  schedules: Array<CodeSchedule>,
}

interface CodeProductType {
  id: number,
  name: string,
  description: string,
  availabilityControl: boolean,
  active: boolean,
  category: {
    id: number,
    name: string,
    active: boolean,
    enumKey: number
  },
  icon: string,
  orderBy: number
}

interface CodeSchedule {
  id: number,
  name: string,
  places: number,
  blocks: number,
  sold: number,
  available: number
}

export { CodeProduct }