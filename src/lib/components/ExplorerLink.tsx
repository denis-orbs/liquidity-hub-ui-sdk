import { useChainConfig } from "../hooks";
import styled, { CSSObject } from "styled-components";

export const ExplorerLink = ({className = '', styles ={}, txHash, text = 'View on explorer'}:{className?: string, styles?: CSSObject, txHash?: string, text?: string}) => {

  const explorerUrl = useChainConfig()?.explorer;
  if (!txHash) return null;
  return (
    <StyledTxHash target='_blank' className={className} href={`${explorerUrl}/tx/${txHash}`} style={styles} >
      {text}
    </StyledTxHash>
  );
};


const StyledTxHash = styled.a`
  color: #d284cf;
  text-decoration: none;
  font-size: 16px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  border-bottom: 1px solid #d284cf;
`;
