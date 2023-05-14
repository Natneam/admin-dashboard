import User from "../model/User.js";
import OverallStat from "../model/OverallStat.js";
import Transaction from "../model/Transaction.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Hardcoded values
    const currentMonth = "November";
    const currentYear = 2021;
    const currentData = "2021-11-15";

    // Recent transactions
    const transactions = await Transaction.find()
      .limit(50)
      .sort({ createdOn: -1 });

    // Overall stats
    const overallStats = await OverallStat.find({ year: currentYear });

    const {
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
    } = overallStats[0];

    const thisMonthStats = overallStats[0].monthlyData.find(
      ({ month }) => month === currentMonth
    );
    const todayStats = overallStats[0].dailyData.find(
      ({ date }) => date === currentData
    );

    res.status(200).json({
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
