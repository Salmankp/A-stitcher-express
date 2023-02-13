const _ = require("lodash");
const Query = require("../../models/Query");

module.exports.searches_get = async (req, res) => {
  let limit = 20;
  let offset = 0;
  if (req.query.page_number && req.query.page_number == 1) offset = 0;
  else if (req.query.page_number && req.query.page_number > 1)
    offset = (req.query.page_number - 1) * limit;
  let queries = await Query.paginate(
    {},
    {
      offset: offset,
      limit: limit,
      sort: {
        createdAt: -1, //Sort by date added DESC
      },
      lean: true,
    }
  ).then((queries) => {
    return queries;
  });

  queries = _.groupBy(queries, "query");
  const final = Object.keys(queries).map((k) => {
    return {
      keyword: k,
      count: queries[k].length,
      lastSearchedOn: queries[k][0].createdAt,
      lastSearchedBy:
        queries[k][0].user.firstName + " " + queries[k][0].user.lastName,
    };
  });

  res.render("searches/searches", { queries: final });
};
