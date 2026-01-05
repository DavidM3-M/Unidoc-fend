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
