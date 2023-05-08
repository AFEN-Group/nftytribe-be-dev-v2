import React from "react";

// import { Box } from "@adminjs/design-system";
import styled from "styled-components";
const Dashboard = () => (
  <WelcomeBody>
    <h1>Welcome</h1>
  </WelcomeBody>
);

const WelcomeBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  h1 {
    font-size: 30px;
  }
`;
export default Dashboard;
