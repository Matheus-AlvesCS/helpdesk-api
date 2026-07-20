export let patternFilters = {
  omit: {
    clientId: true,
    technicianId: true,
  },
  include: {
    client: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    technician: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    services: {
      select: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        price: true,
      },
    },
  },
}
