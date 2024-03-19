import { styled } from "styled-components"
import { FlexRow } from "../../base-styles"
import SwitchArrow from '../../assets/switch-arrow.svg';

export const Separator = () => {
    return <StyledSeparator className="lh-summary-separator">
      <StyledSeparatorCenter className="lh-summary-separator-center">
      <img src={SwitchArrow} />
      </StyledSeparatorCenter>
        
    </StyledSeparator>
  }
  
  const StyledSeparatorCenter = styled(FlexRow)`
    background-color: #1C1924;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    img {
      width: 24px;
    }
  `
  
  const StyledSeparator = styled(FlexRow)`
    color: white;
    display: flex;
    justify-content: center;
    width: 100%;
    position: relative;
    &:before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #433D53;
    }
  `
  