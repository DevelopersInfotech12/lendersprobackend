import Loan from "../models/Loan.js";
import Borrower from "../models/Borrower.js";
import Repayment from "../models/Repayment.js";
import { success } from "../utils/apiResponse.js";
import { autoMarkDefaults } from "../utils/loanStatus.js";

export const getDashboard = async (req, res) => {
  const lender = req.user._id;
  await autoMarkDefaults(lender);

  const [loans, borrowers, repayments] = await Promise.all([
    Loan.find({ lender }),
    Borrower.countDocuments({ lender, isActive: true }),
    Repayment.find({ lender }).sort("-paymentDate").limit(10).populate("borrower", "name"),
  ]);

  const totalPrincipal = loans.reduce((s, l) => s + l.principalAmount, 0);
  const totalInterestEarned = loans.reduce((s, l) => s + (l.totalPaid > l.principalAmount ? Math.min(l.totalPaid - l.principalAmount, l.totalInterest) : 0), 0);
  const totalOutstanding = loans.reduce((s, l) => s + Math.max(l.totalRepayable - l.totalPaid, 0), 0);
  const activeLoans = loans.filter((l) => l.status === "active").length;
  const closedLoans = loans.filter((l) => l.status === "closed").length;
  const overdueLoans = loans.filter((l) => l.status === "active" && new Date(l.dueDate) < new Date()).length;

  // Monthly collections (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyData = await Repayment.aggregate([
    { $match: { lender, paymentDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
        totalCollected: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  success(res, {
    stats: { totalPrincipal, totalInterestEarned, totalOutstanding, activeLoans, closedLoans, overdueLoans, totalBorrowers: borrowers },
    recentRepayments: repayments,
    monthlyData,
  }, "Dashboard fetched");
};
