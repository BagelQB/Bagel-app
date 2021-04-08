import MultiSlider from "multi-slider/lib/MultiSlider";
import {useState} from "react";
import Select from "react-select";

const categoryTranslation = require("../bagel_mappings/categoryTranslation.json");
const categoryMapping = require("../bagel_mappings/categoryMapping.json");
const subcatMapping = require("../bagel_mappings/subcategoryMapping.json");

/**
 * Component that returns a properly formatted slider.
 * @param {Object} params - React params.
 * @param {int} params.min - The minimum value
 * @param {int} params.max - The maximum value
 * @param {int} params.defaultValue - The default value.
 * @param {Function} params.updateFunction - The setState function that this slider should control.
 * @param {int} params.setValue - The value that the slider should hold.
 * @returns {Object} - The slider
 */
export function Slider(params) {

    return <div className={"utility-slider-wrapper"}>
        <input min={params.min} max={params.max} value={params.setValue} defaultValue={params.defaultValue} onChange={(e) => {params.updateFunction(e.target.value)}} className={"utility-slider"} type={"range"}/>
    </div>
}

/**
 * Component that returns a slider with multiple handles (2) [ From @gre/multi-slider ]
 * @param {Object} params - React params.
 * @param {int[]} params.initialValues - The initial values for the slider.
 * @param {Function} params.setMin - The setState function that this slider should control (For the minimum value)
 * @param {Function} params.setMax - The setState function that this slider should control (For the maximum value)
 * @returns {Object} - The slider
 */
export function MultirangeSlider(params) {
    const [values, setValues] = useState(params.initialValues);

    let colors = ["#141d26", "#c51f5d", "#141d26"];
    return(
        <>
            <MultiSlider
                colors={colors}
                handleSize={7}
                handleInnerDotSize={0}
                handleStrokeSize={0}
                height={25}
                bg={"#c51f5d"}
                values={values}
                onChange={(val) => {setValues(val); params.setMin(val[0]); params.setMax(val[0] + val[1]);}}
            />
            <div class={"flex-left-right"} style={{"paddingLeft": "20px", "paddingRight": "20px"}}>
                {Array.from(Array(params.initialValues[1] + 1).keys()).map((v) => <div>{v+1+" "}</div>)}
            </div>

        </>
    );
}



const groupStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
};
const groupBadgeStyles = {
    backgroundColor: '#aaa',
    borderRadius: '2em',
    color: '#172B4D',
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 'normal',
    lineHeight: '1',
    minWidth: 1,
    padding: '0.16666666666667em 0.5em',
    textAlign: 'center',
};
const formatGroupLabel = data => (
    <div style={groupStyles}>
        <span>{data.label}</span>
        <span style={groupBadgeStyles}>{data.options.length}</span>
    </div>
);


const customStyles = {
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#343d46' : '#141d26',
        color: "#fff",
        padding: "3px",
        paddingLeft: "5px",
        transition: "0.1s",
        cursor: "pointer"
    }),
    input: (provided, state) => ({
        ...provided,
        color: "#fff",
    }),
    control: (provided, state) => ({
       ...provided,
        backgroundColor: "#141d26",
        border: "none",
        minHeight: "50px",
        cursor: "text"
    }),
    menu: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: "#141d26"
    }),
    multiValue: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: "#343d46"
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: "#343d46"
    }),
    multiValueRemove: (provided, state) => ({
        ...provided,
        cursor: "pointer",
        margin: "5px"
    }),
}

const options = Object.entries(categoryTranslation).map(([catID, subcatList]) => {return {label: categoryMapping.forwards[catID], options: subcatList.map(({id, name, ...rest}) => {return {value: id, label: name}})}})

/**
 * Component that gives an input to select categories from
 * @param {Function} params.updateFunction - The setState function that this input should control
 * @returns {Object} - The category selector
 */
export function SelectBox(params) {
    return (
        <Select
            styles={customStyles}
            isMulti={true}
            options={options}
            formatGroupLabel={formatGroupLabel}
            onChange={(val) => {params.updateFunction(val.map(({value, ...rest}) => {return value}))}}
        />);

}
