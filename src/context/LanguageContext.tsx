import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "es" | "en";

type Translations = Record<Lang, Record<string, string>>;

const translations: Translations = {
  es: {
    "lang.name": "Español",
    "login.title": "Iniciar sesión",
    "login.subtitle": "¡Hola! Ingresa con tu correo y contraseña",
    "login.forgot": "¿Olvidaste tu contraseña?",
    "login.cta": "Iniciar Sesión",
    "login.noAccount": "¿No tienes una cuenta?",
    "login.register": "Regístrate aquí",
    "login.emailPlaceholder": "ejemplo@correo.com",
    "login.passwordPlaceholder": "••••••••",

    "forgot.title": "Restablecer contraseña",
    "forgot.subtitle": "¿Olvidaste tu contraseña? No te preocupes, restaurémosla",
    "forgot.cta": "Restablecer contraseña",
    "forgot.back": "Volver a iniciar sesión",

    "register.title": "Registro",
    "register.prev": "Anterior",
    "register.next": "Siguiente",
    "register.submit": "Registrarse",
    "register.hasAccount": "¿Ya tienes una cuenta?",
    "register.login": "Iniciar sesión",
    "register.step1.title": "¿Eres nuevo? Empecemos con tu nombre",
    "register.firstName": "Primer nombre*",
    "register.secondName": "Segundo nombre",
    "register.firstLastName": "Primer apellido*",
    "register.secondLastName": "Segundo apellido",
    "register.step2.title": "¡Sigamos con tu identificación!",
    "register.idType": "Tipo identificación*",
    "register.idNumber": "Numero identificación*",
    "register.step3.title": "Ya falta poco, completa esta información.",
    "register.civilStatus": "Estado civil*",
    "register.birthDate": "Fecha de nacimiento*",
    "register.gender": "Género*",
    "register.male": "Masculino",
    "register.female": "Femenino",
    "register.other": "Otro",
    "register.step4.title": "¡Sigamos! Ahora tu lugar de nacimiento",
    "register.country": "País*",
    "register.department": "Departamento*",
    "register.municipality": "Municipio*",
    "register.step5.title": "¡Genial! Ahora tu correo y contraseña",
    "register.email": "Email*",
    "register.password": "Contraseña*",
    "register.passwordConfirm": "Confirmar contraseña*",
    "convocations.title": "Convocatorias",
    "desc.convocations": "Explora las convocatorias disponibles",
    "messages.success": "Operación realizada con éxito",
    "messages.error": "Ocurrió un error, intenta de nuevo",
    "messages.sending": "Enviando...",
    "messages.updating": "Actualizando...",

    "messages.aptitude.adding": "Guardando aptitud...",
    "messages.aptitude.added": "Aptitud agregada con éxito",
    "messages.aptitude.addError": "Error al agregar la aptitud",
    "messages.aptitude.updating": "Actualizando aptitud...",
    "messages.aptitude.updated": "Aptitud actualizada con éxito",
    "messages.aptitude.updateError": "Error al actualizar la aptitud",

    "messages.study.adding": "Guardando estudio...",
    "messages.study.added": "Estudio agregado con éxito",
    "messages.study.addError": "Error al agregar el estudio",
    "messages.study.updating": "Actualizando estudio...",
    "messages.study.updated": "Estudio actualizado con éxito",
    "messages.study.updateError": "Error al actualizar el estudio",

    "messages.experience.adding": "Guardando experiencia...",
    "messages.experience.added": "Experiencia agregada con éxito",
    "messages.experience.addError": "Error al agregar la experiencia",
    "messages.experience.updating": "Actualizando experiencia...",
    "messages.experience.updated": "Experiencia actualizada con éxito",
    "messages.experience.updateError": "Error al actualizar la experiencia",

    "messages.language.adding": "Guardando idioma...",
    "messages.language.added": "Idioma agregado con éxito",
    "messages.language.addError": "Error al agregar el idioma",
    "messages.language.updating": "Actualizando idioma...",
    "messages.language.updated": "Idioma actualizado con éxito",
    "messages.language.updateError": "Error al actualizar el idioma",

    "messages.production.adding": "Guardando producción académica...",
    "messages.production.added": "Producción académica agregada con éxito",
    "messages.production.addError": "Error al agregar la producción académica",
    "messages.production.updating": "Actualizando producción académica...",
    "messages.production.updated": "Producción académica actualizada con éxito",
    "messages.production.updateError": "Error al actualizar la producción académica",

    "messages.evaluation.sending": "Enviando evaluación...",
    "messages.evaluation.sent": "Evaluación enviada con éxito",
    "messages.evaluation.sendError": "Error al enviar la evaluación",
    "messages.evaluation.updating": "Actualizando evaluación...",
    "messages.evaluation.updated": "Evaluación actualizada con éxito",
    "messages.evaluation.updateError": "Error al actualizar la evaluación",
  },
  en: {
    "lang.name": "English",
    "login.title": "Sign in",
    "login.subtitle": "Hi! Sign in with your email and password",
    "login.forgot": "Forgot your password?",
    "login.cta": "Sign In",
    "login.noAccount": "Don't have an account?",
    "login.register": "Register here",
    "login.emailPlaceholder": "example@email.com",
    "login.passwordPlaceholder": "••••••••",

    "forgot.title": "Reset password",
    "forgot.subtitle": "Forgot your password? No worries, let's reset it",
    "forgot.cta": "Reset password",
    "forgot.back": "Back to sign in",

    "register.title": "Register",
    "register.prev": "Back",
    "register.next": "Next",
    "register.submit": "Create account",
    "register.hasAccount": "Already have an account?",
    "register.login": "Sign in",
    "register.step1.title": "New here? Let's start with your name",
    "register.firstName": "First name*",
    "register.secondName": "Second name",
    "register.firstLastName": "First last name*",
    "register.secondLastName": "Second last name",
    "register.step2.title": "Let's continue with your identification!",
    "register.idType": "Identification type*",
    "register.idNumber": "Identification number*",
    "register.step3.title": "Almost there! Complete this information.",
    "register.civilStatus": "Marital status*",
    "register.birthDate": "Date of birth*",
    "register.gender": "Gender*",
    "register.male": "Male",
    "register.female": "Female",
    "register.other": "Other",
    "register.step4.title": "Let's continue! Now your birthplace",
    "register.country": "Country*",
    "register.department": "Department*",
    "register.municipality": "Municipality*",
    "register.step5.title": "Great! Now your email and password",
    "register.email": "Email*",
    "register.password": "Password*",
    "register.passwordConfirm": "Confirm password*",
    "convocations.title": "Convocations",
    "desc.convocations": "Explore available convocations",
    "messages.success": "Operation completed successfully",
    "messages.error": "An error occurred, please try again",
    "messages.sending": "Sending...",
    "messages.updating": "Updating...",

    "messages.aptitude.adding": "Saving aptitude...",
    "messages.aptitude.added": "Aptitude added successfully",
    "messages.aptitude.addError": "Error adding the aptitude",
    "messages.aptitude.updating": "Updating aptitude...",
    "messages.aptitude.updated": "Aptitude updated successfully",
    "messages.aptitude.updateError": "Error updating the aptitude",

    "messages.study.adding": "Saving study...",
    "messages.study.added": "Study added successfully",
    "messages.study.addError": "Error adding the study",
    "messages.study.updating": "Updating study...",
    "messages.study.updated": "Study updated successfully",
    "messages.study.updateError": "Error updating the study",

    "messages.experience.adding": "Saving experience...",
    "messages.experience.added": "Experience added successfully",
    "messages.experience.addError": "Error adding the experience",
    "messages.experience.updating": "Updating experience...",
    "messages.experience.updated": "Experience updated successfully",
    "messages.experience.updateError": "Error updating the experience",

    "messages.language.adding": "Saving language...",
    "messages.language.added": "Language added successfully",
    "messages.language.addError": "Error adding the language",
    "messages.language.updating": "Updating language...",
    "messages.language.updated": "Language updated successfully",
    "messages.language.updateError": "Error updating the language",

    "messages.production.adding": "Saving academic production...",
    "messages.production.added": "Academic production added successfully",
    "messages.production.addError": "Error adding the academic production",
    "messages.production.updating": "Updating academic production...",
    "messages.production.updated": "Academic production updated successfully",
    "messages.production.updateError": "Error updating the academic production",

    "messages.evaluation.sending": "Sending evaluation...",
    "messages.evaluation.sent": "Evaluation submitted successfully",
    "messages.evaluation.sendError": "Error submitting the evaluation",
    "messages.evaluation.updating": "Updating evaluation...",
    "messages.evaluation.updated": "Evaluation updated successfully",
    "messages.evaluation.updateError": "Error updating the evaluation",
  },
};

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    return stored ?? "es";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = (value: Lang) => setLangState(value);

  const t = (key: string, fallback?: string) => translations[lang][key] ?? fallback ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
