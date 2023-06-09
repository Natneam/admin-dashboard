import Product from "../model/Product.js";
import ProductStat from "../model/ProductStat.js";
import User from "../model/User.js";
import Transaction from "../model/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stat = await ProductStat.find({ productId: product._id });
        return {
          ...product._doc,
          stat: stat,
        };
      })
    );
    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    // sort should look like this: { "filed" : "userId", "sort" : "desc" }
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    // formatted sort should look like this: { "userId" : -1 }
    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: sortParsed.order === "asc" ? 1 : -1,
      };

      return sortFormatted;
    };

    const sortFormatted = Boolean(sort) ? generateSort() : {};

    const transactions = await Transaction.find({
      $or: [{ cost: { $regex: new RegExp(search, "i") } }],
      $or: [{ userId: { $regex: new RegExp(search, "i") } }],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Transaction.countDocuments({
      userId: { $regex: search, $options: "i" },
      cost: { $regex: search, $options: "i" },
    });

    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getGeography = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });

    const mappedLocations = users.reduce((acc, { country }) => {
      const countryIso3 = getCountryIso3(country);
      if (!acc[countryIso3]) {
        acc[countryIso3] = 0;
      }
      acc[countryIso3]++;
      return acc;
    }, {});

    const formattedLocations = Object.entries(mappedLocations).map(
      ([country, count]) => ({
        id: country,
        value: count,
      })
    );
    res.status(200).json(formattedLocations);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
