type FilteredTickets = {
  technician: {
    id: string
    name: string
    email: string
  }
  client: {
    id: string
    name: string
    email: string
  }
  services: {
    price: Decimal
    service: {
      id: string
      name: string
    }
  }[]
} & {
  title: string
  status: TicketStatus
  technicianId: string
  id: string
  createdAt: Date
  updatedAt: Date
  clientId: string
}
