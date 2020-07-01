const fetch = require("isomorphic-unfetch");
const { createRemoteFileNode } = require("gatsby-source-filesystem");

exports.sourceNodes = async (
  { actions: { createNode }, createContentDigest, createNodeId, reporter },
  { apiKey }
) => {
  if (!apiKey)
    return reporter.panic(
      "gatsby-source-trackingmore: You must provide your TrackingMore API key"
    );

  const response = await fetch("https://api.trackingmore.com/v2/carriers", {
    headers: {
      "Content-Type": "application/json",
      "Trackingmore-Api-Key": apiKey,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw {
      statusCode: response.status,
      ...json,
    };
  }

  const { data: carriers } = json;

  const processCarrier = async ({ picture, ...carrier }) => ({
    ...carrier,
    pictureUrl: picture,
    id: createNodeId(carrier.code),
    internal: {
      type: `TrackingmoreCarrier`,
      contentDigest: createContentDigest(carrier),
    },
  });

  await Promise.all(
    carriers.map(async (carrier) => createNode(await processCarrier(carrier)))
  );
};

exports.onCreateNode = async ({
  actions: { createNode },
  node,
  store,
  cache,
  createNodeId,
  reporter,
}) => {
  if (node.internal.type === "TrackingmoreCarrier" && node.pictureUrl) {
    let pictureNode;

    try {
      const { id } = await createRemoteFileNode({
        url: node.pictureUrl.replace("//", "http://"),
        parentNodeId: node.id,
        store,
        cache,
        createNode,
        createNodeId,
      });

      pictureNode = id;
    } catch (err) {
      reporter.log(
        `gatsby-source-trackingmore: No picture at ${node.pictureUrl}. Skipping!`
      );
    }

    node.picture___NODE = pictureNode;
  }
};
