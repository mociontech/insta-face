/* eslint-disable react/prop-types */
import { ChangeEvent, useEffect, useState } from "react";
interface FieldsType {
  nombre: {
    type: string;
    value: string;
    imageRef: string;
    placeholder: string;
  };
    empresa: {
    type: string;
    value: string;
    imageRef: string;
    placeholder: string;
  };
  correo: {
    type: string;
    value: string;
    imageRef: string;
    placeholder: string;
  };
  telefono: {
    type: string;
    value: string;
    imageRef: string;
    placeholder: string;
  };
}

interface Props {
  fields: FieldsType;
  onSubmit: (data: FieldsType) => void;
}
export default function Register({ fields, onSubmit }: Props) {
  const [formData, setFormData] = useState(fields);
  const [isReady, setIsReady] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  function handleChange(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
    parentKey = null
  ) {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      if (parentKey) {
        return {
          ...prevFormData,
          [parentKey]: {
            ...prevFormData[parentKey],
            [name]: { ...prevFormData[parentKey][name], value },
          },
        };
      } else {
        return {
          ...prevFormData,
          [name]: { ...prevFormData[name], value },
        };
      }
    });
  }

  useEffect(() => {
    // const allFieldsFilled = Object.values(formData).every((field) => {
    //   if (typeof field === "object" && !field.type) {
    //     return Object.values(field).every(
    //       (subField: any) => subField.value?.trim() !== ""
    //     );
    //   }
    //   return field.value?.trim() !== "";
    // });
    setIsReady(true);
  }, [formData]);

  function submitForm() {
    if (!isChecked) return;
    onSubmit(formData);
    const resetFields = Object.keys(fields).reduce((acc, key) => {
      if (typeof fields[key] === "object" && !fields[key].type) {
        acc[key] = Object.keys(fields[key]).reduce((subAcc, subKey) => {
          subAcc[subKey] = { ...fields[key][subKey], value: "" };
          return subAcc;
        }, {});
      } else {
        acc[key] = { ...fields[key], value: "" };
      }
      return acc;
    }, {});
    setFormData({
      correo: { type: "", value: "", imageRef: "", placeholder: "" },
      nombre: { type: "", value: "", imageRef: "", placeholder: "" },
      telefono: { type: "", value: "", imageRef: "", placeholder: "" },
      empresa: { type: "", value: "", imageRef: "", placeholder: "" },
    });
  }

  const renderInput = (key, item, parentKey = null) => {
    if (item.type === "select") {
      return (
        <div key={key} className="relative flex-1 min-w-0">
          {item.imageRef && (
            <label htmlFor={key}>
              <img
                src={item.imageRef}
                className="absolute z-50 w-7 h-7 sm:w-12 sm:h-12 text-white/50 top-1/2 -translate-y-1/2 left-4 sm:left-6"
                alt="icon"
              />
            </label>
          )}
          <select
            id={key}
            name={key}
            value={item.value}
            className={`no-spinner w-full text-[20px] sm:text-[50px] h-[70px] sm:h-[110px] text-white/50 bg-white/15 rounded-xl sm:rounded-3xl border-[1.5px] border-white placeholder:text-white/50 ${
              item.imageRef ? "pl-[50px] sm:pl-[90px]" : "pl-4"
            }`}
            onChange={(e) => handleChange(e, parentKey)}
          >
            <option value="" disabled>
              {item.placeholder}
            </option>
            {item.options.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={key} className="relative flex-1 min-w-0">
        {item.imageRef && (
          <label htmlFor={key}>
            <img
              src={item.imageRef}
              className="absolute z-50 w-7 h-7 sm:w-12 sm:h-12 text-white/50 top-1/2 -translate-y-1/2 left-4 sm:left-6"
              alt="icon"
            />
          </label>
        )}
        <input
          type={item.type}
          id={key}
          name={key}
          value={item.value}
          placeholder={item.placeholder}
          
          className={`no-spinner text-[20px] sm:text-[50px] w-full h-[70px] sm:h-[110px] ${
            item.imageRef ? "pl-[50px] sm:pl-[90px]" : "pl-4"
          } text-white/50 bg-white/15 rounded-xl sm:rounded-3xl border-[1.5px] border-white placeholder:text-white/50`}
          autoComplete="off"
          onChange={(e) => handleChange(e, parentKey)}
        />
      </div>
    );
  };

  return (
    <div className="telegraf-regular flex flex-col justify-center gap-5 sm:gap-10 px-2 max-w-full sm:max-w-[855px] mx-auto mt-[150px]">
      {/* {Object.entries(formData).map(([key, value]) => {
        if (typeof value === "object" && !value.type) {
          return (
            <div key={key} className="flex flex-wrap gap-4 w-full sm:w-[839px]">
              {Object.entries(value).map(([subKey, subItem]) => (
                <div key={subKey} className="flex-1 min-w-[150px]">
                  {renderInput(subKey, subItem, key)}
                </div>
              ))}
            </div>
          );
        }
        return renderInput(key, value);
      })} */}

      <div className="text-white flex justify-center items-center">
      <input
        className="w-[40px] h-[40px]"
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        autoComplete="off"
      />
      <span
        className="ml-4 underline text-4xl cursor-pointer"
        onClick={handleShowPopup}
      >
        Aceptación de términos y condiciones.
      </span>

      {showPopup && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[100]"
          onClick={handleClosePopup}
        >
          <div
            className="bg-gray p-4 rounded-lg relative " 
            onClick={(e) => e.stopPropagation()}
          >
            <img src="terminos.png" alt="Terminos y condiciones " />
            <button
              className="absolute top-6 right-6 text-white hover:text-red-500 " 
              onClick={handleClosePopup}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
      <button
        className="relative flex justify-center items-center top-[60px] bg-[#252525] text-white text-[40px] rounded-xl h-[130px] "
        disabled={!isReady}
        onClick={submitForm}
      >
        INICIAR
      </button>
    </div>
  );
}
