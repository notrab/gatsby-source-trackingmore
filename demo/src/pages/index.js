import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import Img from "gatsby-image";

const pageQuery = graphql`
  {
    carriers: allTrackingmoreCarrier {
      nodes {
        id
        name
        picture {
          childImageSharp {
            fluid(maxWidth: 500) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`;

function IndexPage() {
  const { carriers } = useStaticQuery(pageQuery);

  return (
    <React.Fragment>
      <h1>Trackingmore carriers:</h1>

      <ul>
        {carriers.nodes.map((carrier) => (
          <li key={carrier.id}>
            {carrier.picture && (
              <Img
                fluid={carrier.picture.childImageSharp.fluid}
                style={{ width: "75px" }}
              />
            )}
            {carrier.name}
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

export default IndexPage;
