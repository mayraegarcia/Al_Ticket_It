
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "../../theme/ThemeContext";
import Ticketito from "../mascot/Ticketito";
import ThemeToggle from "../ui/ThemeToggle";

import MyTicketsScreen from "../../features/events/screens/MyTicketsScreen";
import EventDetailScreen from "../../features/events/screens/EventDetailScreen";
import HomeScreen from "../../features/events/screens/HomeScreen";
import PlaceholderScreen from "../../features/shared/PlaceholderScreen";

import OrganizerHomeScreen from "../../features/organizer/OrganizerHomeScreen";
import MyEventsScreen from "../../features/organizer/MyEventsScreen";
import CreateEventScreen from "../../features/organizer/CreateEventScreen";
import ManageTicketTypesScreen from "../../features/organizer/ManageTicketTypeScreen";
import EventSalesScreen from "../../features/organizer/EventSalesScreen";

import ProfileScreen from "../../features/shared/ProfileScreen";
import MisFavoritosScreen from "../../features/shared/MyFavouritsScreen";

import AuthScreen from "../../features/auth/authScreen";
import { useAuth } from "../../context/authContext";


const tabsComprador = [
  { name: "Explorar", icon: "⌕" },
  { name: "Mis entradas", icon: "▣" },
  { name: "Perfil", icon: "◉" },
];

const tabsOrganizador = [
  { name: "Inicio", icon: "⌂" },
  { name: "Mis eventos", icon: "▣" },
  { name: "Crear", icon: "+" },
  { name: "Configurar entradas", icon: "⚙" },
  { name: "Perfil", icon: "◉" },
];

export default function AppShell() {
  const { C, dark } = useTheme();
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [eventoParaConfigurar, setEventoParaConfigurar] = useState(null);
  const [eventoParaVentas, setEventoParaVentas] = useState(null);
  const [viendoFavoritos, setViendoFavoritos] = useState(false);

  const {
    usuario,
    autenticado,
    cargando,
    establecerSesion,
    cerrarSesion,
  } = useAuth();

  const esOrganizador = usuario?.rol === "ORGANIZADOR";

  const tabs = esOrganizador
  ? tabsOrganizador
  : tabsComprador;

  const [tab, setTab] = useState("Explorar");

  useEffect(() => {
    setTab(esOrganizador ? "Inicio" : "Explorar");
    setEventoSeleccionado(null);
    setEventoParaConfigurar(null);
    setEventoParaVentas(null);
    setViendoFavoritos(false);
  }, [usuario?.id, esOrganizador]);

  if (cargando) {
    return (
      <SafeAreaView
        style={[
          s.safe,
          {
            backgroundColor: C.bg,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Ticketito size={100} />

        <Text style={{ color: C.muted, marginTop: 15 }}>
          Preparando Ticketito...
        </Text>
      </SafeAreaView>
    );
  }

  if (!autenticado) {
    return (
      <AuthScreen
        onAuthenticated={establecerSesion}
      />
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />

      {/* Encabezado */}
      <View style={[s.header, { borderColor: C.border }]}>
        <View style={s.brand}>
          <Ticketito size={42} />
          <Text style={[s.brandText, { color: C.text }]}>
            Al Ticket It
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <ThemeToggle />

          <Pressable onPress={cerrarSesion}>
            <Text style={{ color: C.primary, fontWeight: "800" }}>
              Salir
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={{ flex: 1 }}>
        {esOrganizador ? (
          tab === "Inicio" ? (
            <OrganizerHomeScreen onNavigate={setTab} />
          ) : tab === "Mis eventos" ? (
            <MyEventsScreen
              onConfigurar={(evento) => {
                setEventoParaConfigurar(evento);
                setTab("Configurar entradas");
              }}
              onVerVentas={(evento) => {
                setEventoParaVentas(evento);
                setTab("Ventas del evento");
              }}
            />
          ) : tab === "Ventas del evento" ? (
            <EventSalesScreen
              evento={eventoParaVentas}
              usuario={usuario}
              onBack={() => {
                setEventoParaVentas(null);
                setTab("Mis eventos");
              }}
            />
          ) : tab === "Crear" ? (
            <CreateEventScreen
              onCreated={(evento) => {
                setEventoParaConfigurar(evento);
                setTab("Configurar entradas");
              }}
            />
          ) : tab === "Configurar entradas" ? (
            eventoParaConfigurar ? (
              <ManageTicketTypesScreen
                evento={eventoParaConfigurar}
                onBack={() => {
                  setEventoParaConfigurar(null);
                  setTab("Mis eventos");
                }}
                onPublished={() => {
                  setEventoParaConfigurar(null);
                  setTab("Mis eventos");
                }}
              />
            ) : (
              <MyEventsScreen
                onConfigurar={(evento) => {
                  setEventoParaConfigurar(evento);
                  setTab("Configurar entradas");
                }}
                onVerVentas={(evento) => {
                  setEventoParaVentas(evento);
                  setTab("Ventas del evento");
                }}
              />
            )
          ) : (
            <ProfileScreen />
          )
        ) : viendoFavoritos ? (
          <MisFavoritosScreen
            onBack={() => setViendoFavoritos(false)}
            onVerEvento={(evento) => {
              setViendoFavoritos(false);
              setTab("Explorar");
              setEventoSeleccionado(evento);
            }}
          />
        ) : (
          tab === "Explorar" ? (
            eventoSeleccionado ? (
              <EventDetailScreen
                event={eventoSeleccionado}
                onBack={() => setEventoSeleccionado(null)}
              />
            ) : (
              <HomeScreen
                onEventPress={(evento) => {
                    setEventoSeleccionado(evento);
                }}
            />
            )
          ) : tab === "Mis entradas" ? (
            <MyTicketsScreen usuario={usuario} />
          ) : (
            <ProfileScreen
              onVerFavoritos={() => setViendoFavoritos(true)}
            />
          )
        )}
      </View>


      {/* Navegación inferior */}
      <View style={[s.nav, { backgroundColor: C.nav, borderColor: C.border }]}>
        {tabs.map((item) => {
          const active = tab === item.name;

          return (
            <Pressable
              key={item.name}
              onPress={() => {
                setViendoFavoritos(false);
                setTab(item.name);
              }}
              style={s.navItem}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  s.navIcon,
                  { color: active ? C.primary : C.muted },
                ]}
              >
                {item.icon}
              </Text>

              <Text
                style={[
                  s.navLabel,
                  {
                    color: active ? C.primary : C.muted,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -1,
  },
  content: {
    flex: 1,
  },
  nav: {
    minHeight: 70,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minWidth: 70,
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 19,
  },
  navLabel: {
    fontSize: 11,
  },
});
