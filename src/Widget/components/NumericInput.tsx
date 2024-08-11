import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { FlexRow } from '../../lib/base-styles';

export interface NumericInputProps {
  onChange?: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
  className?: string;
  maxValue?: string;
  prefix?: string;
  decimalScale?: number;
  minAmount?: number;
}

export function NumericInput({
  prefix = '',
  onChange,
  value,
  disabled = false,
  placeholder,
  onFocus,
  onBlur,
  loading = false,
  className = '',
  maxValue,
  decimalScale,
  minAmount,
}: NumericInputProps) {
  const inputValue = value || minAmount || '';

  return (
    <StyledContainer className={`lh-input ${className}`}>
      {loading && <StyledLoader className="lh-input-loader" />}

      <FlexRow
        style={{
          opacity: loading ? 0 : 1,
        }}
      >
        <NumericFormat
          allowNegative={false}
          disabled={disabled}
          decimalScale={decimalScale}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          isAllowed={(values) => {
            const { floatValue = 0 } = values;
            return maxValue ? floatValue <= parseFloat(maxValue) : true;
          }}
          prefix={prefix ? `${prefix} ` : ""}
          value={disabled && value === "0" ? "" : inputValue}
          thousandSeparator=","
          decimalSeparator="."
          customInput={StyledInput}
          type="text"
          min={minAmount}
          onValueChange={(values, _sourceInfo) => {
            if (_sourceInfo.source !== "event") {
              return;
            }

            onChange && onChange(values.value);
          }}
        />
      </FlexRow>
    </StyledContainer>
  );
}

const StyledLoader = styled.div``;

const StyledContainer = styled.div({
  flex: 1,
  height: '100%',
  position: 'relative',
});

const StyledInput = styled.input<{ disabled: boolean }>`
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'unset')};
  height: 100%;
  width: 100%;
  font-size: 16px;
  border: unset;
  background: transparent;
  outline: unset;
  font-weight: 500;
`;
