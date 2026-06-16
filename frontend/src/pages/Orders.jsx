const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-orange-100 text-orange-600";

    case "Shipped":
      return "bg-blue-100 text-blue-600";

    case "Delivered":
      return "bg-green-100 text-green-600";

    case "Cancelled":
      return "bg-red-100 text-red-600";

    default:
      return "";
  }
};