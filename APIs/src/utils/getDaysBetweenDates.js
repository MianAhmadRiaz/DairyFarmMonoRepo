const getDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    let end = new Date();
    if (endDate) end = new Date(endDate)
    if (isNaN(start) || isNaN(end)) {
        throw new Error("Invalid date format. Please provide valid dates.");
    }
    const diffInTime = end - start;
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

    return diffInDays;
};

export default getDaysBetweenDates;
