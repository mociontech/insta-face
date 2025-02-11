"use client";

import {useEffect, useState, useRef, useCallback} from "react";
import axios from "axios";
import Loader from "@/components/Loader";
import {configVariables} from "@/configVariables";
import {useRouter} from "next/navigation";
import {useUser} from "@/hooks/useUser";

export default function RegisterExperiencePage() {
    const [isLoading, setIsLoading] = useState(false);
    const {push} = useRouter();
    const {setLogged, setUser} = useUser();

    const [formData, setFormData] = useState({id1: "", id2: "", score: ""});
    const [eventParams, setEventParams] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const id1Ref = useRef(null);
    const id2Ref = useRef(null);

    const handleChange = useCallback((e) => {
        const {name, value} = e.target;
        if (value.length > 3) return;

        setFormData((prevData) => {
            const updatedData = {...prevData, [name]: value.toUpperCase()};

            if (name === "id1" && value.length === 3) {
                id2Ref.current?.focus();
            }

            return updatedData;
        });
    }, []);

    const isReadyId = formData.id1 !== "" && formData.id2 !== "";

    useEffect(() => {
        const getEventParams = async () => {
            try {
                const response = await axios.get(
                    `${configVariables.baseUrl}/api/events/check/${configVariables.databaseId}`
                );
                setEventParams(response.data);
            } catch (error) {
                console.error("Error fetching event params:", error);
            }
        };

        getEventParams();
    }, []);

    const resetForm = useCallback(() => {
        setFormData({id1: "", id2: "", score: ""});
    }, []);

    const checkUserParticipation = useCallback(async () => {
        try {
            setIsLoading(true);

            const checkUser = await axios.post(
                `${configVariables.baseUrl}/api/users/check/${configVariables.databaseId}/${configVariables.eventName}`,
                {
                    userId: formData.id1 + formData.id2,
                    experienceName: "instaFace",
                }
            );

            setIsLoading(false);

            if (checkUser.data.notRegistered) {
                Toast("Por favor regístrate en el evento");
                return;
            }

            if (checkUser.data.alreadyRegistered) {
                Toast("Parece que ya participaste en esta experiencia. ¡Gracias!");
            } else {
                setUser({
                    mail: checkUser.data.user.mail,
                    code: formData.id1 + formData.id2,
                });
                setLogged(true);
                push("/camera");
            }
        } catch (error) {
            setIsLoading(false);
            Toast("Ups, algo salió mal");
        }
    }, [formData, eventParams, resetForm, setUser, setLogged, push]);

    const Toast = useCallback((msg) => {
        setShowToast(true);
        setToastMessage(msg);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    }, []);

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="score-background w-screen h-screen flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="flex flex-col justify-center items-center">
                        <h2 className="telegraf-bold text-white text-[120px]">Agrega ID</h2>
                        <div className="telegraf-bold flex items-center text-[#DEF44B] text-[80px] gap-3 mb-10">
                            <input
                                type="text"
                                id="id1"
                                name="id1"
                                autoComplete="off"
                                autoFocus
                                value={formData.id1}
                                className="w-[230px] bg-white/30 border-[3px] rounded-[16px] text-center pt-3"
                                onChange={handleChange}
                                ref={id1Ref}
                                maxLength={3}
                            />
                            <img src="/dash.svg" className="w-[36px] h-[10px]" alt=""/>
                            <input
                                type="text"
                                id="id2"
                                name="id2"
                                autoComplete="off"
                                value={formData.id2}
                                className="w-[230px] bg-white/30 border-[3px] rounded-[16px] text-center pt-3"
                                onChange={handleChange}
                                ref={id2Ref}
                                maxLength={3}
                            />
                        </div>
                        <button
                            className="relative top-[60px] w-[850px] h-[100px] text-[50px] bg-transparent "
                            disabled={!isReadyId}
                            onClick={checkUserParticipation}
                        ></button>
                    </div>
                </div>
            </div>
            {isLoading && <Loader/>}
            {showToast && (
                <div
                    className={`telegraf-regular text-center fixed top-10 left-1/2 transform text-[2em] -translate-x-1/2 bg-[#F5F5F5] text-black px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500 ${
                        showToast ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {toastMessage}
                </div>
            )}
        </div>
    );
}