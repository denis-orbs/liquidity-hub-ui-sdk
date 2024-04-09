import { useShallow } from "zustand/react/shallow";
import { useChainConfig } from "../hooks";
import { useSwapState } from "../store/main";
import styled, { CSSObject } from "styled-components";
import {ExternalLink} from 'react-feather'

export const ExplorerLink = ({className = '', styles ={}}:{className?: string, styles?: CSSObject}) => {
  const { txHash } = useSwapState(
    useShallow((s) => ({
      txHash: s.txHash,
    }))
  );

  const explorerUrl = useChainConfig()?.explorerUrl;
  if (!txHash) return null;
  return (
    <StyledTxHash target='_blank' className={className} href={`${explorerUrl}/tx/${txHash}`} style={styles} >
      View on explorer <StyledExternalLink width={15} height={15} />
    </StyledTxHash>
  );
};

const StyledExternalLink = styled(ExternalLink)`
    position: relative;
    top: 2px;
`

const StyledTxHash = styled.a`
  color: #d284cf;
  text-decoration: none;
  font-size: 16px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  border-bottom: 1px solid #d284cf;
`;
