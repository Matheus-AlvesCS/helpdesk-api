export function formatTicket(ticket: FilteredTickets) {
  return {
    ...ticket,
    totalPrice: ticket.services
      .reduce((acc, current) => Number(current.price) + acc, 0)
      .toFixed(2),
  }
}
