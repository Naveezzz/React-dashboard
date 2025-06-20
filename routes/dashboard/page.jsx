import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline, Popup as LeafletPopup } from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import { MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import "leaflet/dist/leaflet.css";
import VehicleDashboardPage from "./VehicleDashboardPage";
// Mock theme hook
const useTheme = () => ({ theme: 'light' });

// Mock Footer component
const Footer = () => (
    <div className="mt-8 p-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Copyright © 2025 BayesVision - All Rights Reserved.
    </div>
);

// Utility to get lat/lng from address
async function geocodeAddress(address) {
    const mockGeo = {
        "Bandra Office": [19.0602, 72.8347],
        "Andheri Site": [19.1197, 72.8468],
        "Powai Complex": [19.1205, 72.9095],
        "Kurla Station": [19.0726, 72.8822],
        "Worli Tower": [19.0176, 72.8562],
        "CP Office": [28.6315, 77.2167],
        "Rajouri Garden": [28.6448, 77.1236],
        "Karol Bagh": [28.6517, 77.1908],
        "Lajpat Nagar": [28.5708, 77.2432],
        "Saket Mall": [28.5224, 77.2207],
    };
    return mockGeo[address] || [19.0760, 72.8777];
}

Modal.setAppElement("#root");

const DatePicker = ({ selectedDate, onDateSelect, isOpen, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
        for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
        return days;
    };

    const handleDateClick = (date) => {
        if (date) {
            const formattedDate = `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
            onDateSelect(formattedDate);
            onClose();
        }
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const days = getDaysInMonth(currentMonth);
    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-4 min-w-80">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronLeft size={16} /></button>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                    <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        disabled={!date}
                        className={`
                            h-8 w-8 text-sm rounded flex items-center justify-center transition-colors
                            ${!date ? 'invisible' : ''}
                            ${date ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-900 dark:text-slate-50' : ''}
                            ${date && date.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        `}
                    >
                        {date ? date.getDate() : ''}
                    </button>
                ))}
            </div>
        </div>
    );
};

async function fetchMultiLegRoute(positions) {
    if (positions.length < 2) return [];
    let routeCoords = [];
    for (let i = 0; i < positions.length - 1; i++) {
        const from = positions[i].latlng;
        const to = positions[i + 1].latlng;
        // OSRM expects lon,lat order!
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=polyline`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                const segment = polyline.decode(data.routes[0].geometry);
                // Avoid duplicate: skip first point if not the very first segment
                if (i > 0) segment.shift();
                routeCoords.push(...segment);
            }
        } catch {}
    }
    return routeCoords;
}

const PlotSitesMapModal = ({ isOpen, onRequestClose, sites, person }) => {
    const [positions, setPositions] = useState([]);
    const [route, setRoute] = useState([]);
    useEffect(() => {
        async function fetchPositionsAndRoute() {
            const pos = [];
            for (const site of sites) {
                const latlng = await geocodeAddress(site.name);
                pos.push({ ...site, latlng });
            }
            setPositions(pos);
            if (pos.length >= 2) {
                const routePolyline = await fetchMultiLegRoute(pos);
                setRoute(routePolyline);
            } else {
                setRoute([]);
            }
        }
        if (isOpen) fetchPositionsAndRoute();
    }, [isOpen, sites]);
    if (!isOpen) return null;
    const center = positions.length > 0 ? positions[0].latlng : [19.0760, 72.8777];
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Site Map"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-0 max-w-2xl w-full outline-none"
        >
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
                    Site Map - {person.name} ({person.id})
                </h2>
                <button onClick={onRequestClose} className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 text-2xl px-2">×</button>
            </div>
            <div className="h-96 w-full p-4">
                <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {positions.map((site, idx) => (
                        <Marker
                            key={site.name + idx}
                            position={site.latlng}
                            icon={L.icon({
                                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                                iconSize: [32, 32],
                                iconAnchor: [16, 32]
                            })}
                        >
                            <LeafletPopup>
                                <div>
                                    <strong>{site.name}</strong><br />
                                    Status: {site.status}<br />
                                    Time: {site.time}
                                </div>
                            </LeafletPopup>
                        </Marker>
                    ))}
                    {route.length > 1 && (
                        <Polyline
                            positions={route}
                            color="blue"
                            weight={3}
                        />
                    )}
                </MapContainer>
            </div>
        </Modal>
    );
};


const DEFAULT_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.181106222302!2d-122.41941568468248!3d37.77492977975917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064d25b0ffb%3A0x8c2e2df9f9e4e1ee!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1623177893573!5m2!1sen!2sus";
const DEFAULT_LOCATION = "San Francisco, CA, USA";
const DEFAULT_NAME = "";
const DEFAULT_ID = "";

const MonitoringProfileStats = ({
    isDefault,
    avatar,
    avatarError,
    avatarLoaded,
    name,
    monitoringLabel,
    stats,
    setAvatarLoaded,
    setAvatarError,
}) => (
    <>
        {/* Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-center">
                <div style={{ width: 64, height: 64, margin: "0 auto" }}>
                    {(!isDefault && avatar && !avatarError) && (
                        <img
                            src={avatar}
                            alt={name}
                            className={`w-16 h-16 rounded-full mx-auto mb-3 object-cover transition-opacity duration-200 ${avatarLoaded ? "opacity-100" : "opacity-0"}`}
                            onLoad={() => setAvatarLoaded && setAvatarLoaded(true)}
                            onError={() => setAvatarError && setAvatarError(true)}
                            style={{ minHeight: 64, minWidth: 64 }}
                        />
                    )}
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-50">
                    {monitoringLabel}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Last Update: 17 Nov 2021 16:23</p>
            </div>
        </div>
        {/* Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-50">{stats.totalSites !== "" ? stats.totalSites : " "}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Site</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-green-600">{stats.normalSites !== "" ? stats.normalSites : " "}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Normal Site</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-red-600">{stats.alertSites !== "" ? stats.alertSites : " "}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Site Alert</div>
                </div>
            </div>
        </div>
    </>
);

const DashboardPage = () => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("person");

    // Removed local mock data. Replace with API fetch result.
    const [personMonitoringData, setPersonMonitoringData] = useState([]);

    // Empty person and stats for initial state
    const emptyPerson = {
        id: "",
        name: "",
        location: "",
        currentLocation: "",
        status: "",
        lastUpdate: "",
        avatar: "",
        mapUrl: "",
        sites: []
    };
    const [selectedPerson, setSelectedPerson] = useState(emptyPerson);
    const [editFields, setEditFields] = useState({
        id: "",
        name: "",
        location: "",
        status: "",
        lastUpdate: ""
    });
    const [monitoringStats, setMonitoringStats] = useState({
        totalSites: "",
        normalSites: "",
        alertSites: ""
    });

    // Avatar loading for placeholder
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    useEffect(() => { setAvatarLoaded(false); setAvatarError(false); }, [selectedPerson.avatar]);

    // Pagination for site table
    const [sitePage, setSitePage] = useState(1);
    const sitesPerPage = 6;
    const totalSites = selectedPerson.sites.length;
    const totalPages = Math.ceil(totalSites / sitesPerPage);
    const paginatedSites = selectedPerson.sites.slice((sitePage - 1) * sitesPerPage, sitePage * sitesPerPage);

    // Which map and overlay data to use: default or selectedPerson
    const isDefault = !selectedPerson.id && !selectedPerson.name;
    const mapUrl = isDefault ? DEFAULT_MAP_URL : selectedPerson.mapUrl;
    const mapName = isDefault ? DEFAULT_NAME : selectedPerson.name;
    const mapId = isDefault ? DEFAULT_ID : selectedPerson.id;
    const mapLocation = isDefault ? DEFAULT_LOCATION : selectedPerson.currentLocation;
    const mapStatus = isDefault ? "" : selectedPerson.status;
    const mapLastUpdate = isDefault ? "" : selectedPerson.lastUpdate;

    useEffect(() => {
        setSitePage(1);
    }, [selectedPerson]);

    useEffect(() => {
        setEditFields({
            id: selectedPerson.id,
            name: selectedPerson.name,
            location: selectedPerson.location,
            status: selectedPerson.status,
            lastUpdate: selectedPerson.lastUpdate
        });
        if (selectedPerson && selectedPerson.sites && selectedPerson.sites.length > 0) {
            setMonitoringStats({
                totalSites: selectedPerson.sites.length,
                normalSites: selectedPerson.sites.filter(s => s.status === "Normal").length,
                alertSites: selectedPerson.sites.filter(s => s.status === "Alert").length
            });
        } else {
            setMonitoringStats({
                totalSites: "",
                normalSites: "",
                alertSites: ""
            });
        }
    }, [selectedPerson]);

    const handleFieldChange = (e) => {
        setEditFields({
            ...editFields,
            [e.target.name]: e.target.value
        });
    };

    // Fetch from Flask API when filter is clicked
    const handleFind = async () => {
        const params = {};
        if (editFields.id) params.id = editFields.id;
        if (editFields.name) params.name = editFields.name;
        if (editFields.location) params.location = editFields.location;
        if (editFields.status) params.status = editFields.status;
        if (editFields.lastUpdate) params.lastUpdate = editFields.lastUpdate;

        try {
            const response = await axios.get('http://localhost:5000/api/personnel', { params });
            const data = response.data;
            setPersonMonitoringData(data);
            if (data.length > 0) {
                setSelectedPerson(data[0]);
            } else {
                setSelectedPerson(emptyPerson);
            }
        } catch (error) {
            setSelectedPerson(emptyPerson);
        }
    };

    const handleDateSelect = (formattedDate) => {
        setEditFields({
            ...editFields,
            lastUpdate: formattedDate
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDatePickerOpen && !event.target.closest('.date-picker-container')) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePickerOpen]);

    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedTab === "person" ? "Person Monitoring" : "Vehicle Monitoring"}</h1>
                <div className="flex items-center gap-3">
                    {/* Radio buttons just left of Live Monitoring */}
                    <div className="flex items-center gap-2 mr-2">
                        <label className="flex items-center cursor-pointer" style={{ background: "transparent" }}>
                            <input
                                type="radio"
                                name="monitorType"
                                value="person"
                                checked={selectedTab === "person"}
                                onChange={() => setSelectedTab("person")}
                                style={{
                                    accentColor: "#3b82f6",
                                    width: 18,
                                    height: 18,
                                    background: "transparent",
                                    border: "2px solid #3b82f6",
                                    boxShadow: "none",
                                    margin: 0,
                                }}
                                className="mr-1"
                            />
                            <span className="text-blue-300 font-medium text-base" style={{ background: "transparent" }}>Person</span>
                        </label>
                        <label className="flex items-center cursor-pointer" style={{ background: "transparent" }}>
                            <input
                                type="radio"
                                name="monitorType"
                                value="vehicle"
                                checked={selectedTab === "vehicle"}
                                onChange={() => setSelectedTab("vehicle")}
                                style={{
                                    accentColor: "#3b82f6",
                                    width: 18,
                                    height: 18,
                                    background: "transparent",
                                    border: "2px solid #3b82f6",
                                    boxShadow: "none",
                                    margin: 0,
                                }}
                                className="mr-1"
                            />
                            <span className="text-blue-300 font-medium text-base" style={{ background: "transparent" }}>Vehicle</span>
                        </label>
                    </div>
                    <div className="flex items-center bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live Monitoring</span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Last Update: 17 Nov 2021 16:23
                    </span>
                </div>
            </div>
            {selectedTab === "vehicle"
                ? <VehicleDashboardPage monitoringLabel="Vehicle Monitoring" />
                : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                                <div className="flex gap-2 mb-4">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Person Name / Person ID"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter'}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                                    >
                                        Search
                                    </button>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Searching Result:
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Person ID</span>
                                        <input
                                            type="text"
                                            name="id"
                                            placeholder="Enter Person ID"
                                            value={editFields.id}
                                            onChange={handleFieldChange}
                                            className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Person Name</span>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter Person Name"
                                            value={editFields.name}
                                            onChange={handleFieldChange}
                                            className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Person Location</span>
                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Enter Person Location"
                                            value={editFields.location}
                                            onChange={handleFieldChange}
                                            className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Person Status</span>
                                        <input
                                            type="text"
                                            name="status"
                                            placeholder="Enter Person Status (e.g. Movement, Stationary)"
                                            value={editFields.status}
                                            onChange={handleFieldChange}
                                            className={`w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm ${editFields.status === 'Movement' ? 'text-red-600' : 'text-green-600'
                                                }`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Last Update</span>
                                        <div className="relative date-picker-container">
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="lastUpdate"
                                                    placeholder="Enter Last Update (e.g. 01 April 2022 23:42)"
                                                    value={editFields.lastUpdate}
                                                    onChange={handleFieldChange}
                                                    className="w-28 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-l bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                                                />
                                                <button
                                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                                    className="px-2 py-1 border border-l-0 border-slate-300 dark:border-slate-600 rounded-r bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    <Calendar size={14} className="text-slate-600 dark:text-slate-400" />
                                                </button>
                                            </div>
                                            <DatePicker
                                                selectedDate={editFields.lastUpdate}
                                                onDateSelect={handleDateSelect}
                                                isOpen={isDatePickerOpen}
                                                onClose={() => setIsDatePickerOpen(false)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleFind}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium mt-2"
                                        >
                                            Filter
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-3">Last Location</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {selectedPerson.currentLocation}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                        Region: {selectedPerson.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Center Panel - Google Maps */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 h-96 relative overflow-hidden flex items-center justify-center">
                                {/* Default or Selected Map */}
                                {mapUrl ? (
                                    <iframe
                                        src={mapUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="rounded-lg"
                                        title="Person Location Map"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                                )}
                                {/* Map Overlay - show only if something to display */}
                                <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 max-w-xs z-20 border border-slate-200 dark:border-slate-600">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">Current Location</span>
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                        <div><strong className="text-slate-900 dark:text-slate-50">{mapName}</strong> {mapId && `(${mapId})`}</div>
                                        <div>{mapLocation}</div>
                                        {mapStatus && (
                                            <div>Status: <span className={mapStatus === 'Movement' ? 'text-red-600' : 'text-green-600'}>{mapStatus}</span></div>
                                        )}
                                        {mapLastUpdate && (
                                            <div>Updated: {mapLastUpdate}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Panel - Profile and Stats */}
                        <div className="lg:col-span-1 space-y-6">
                            <MonitoringProfileStats
                                isDefault={isDefault}
                                avatar={selectedPerson.avatar}
                                avatarError={avatarError}
                                avatarLoaded={avatarLoaded}
                                name={selectedPerson.name}
                                monitoringLabel="Person Monitoring"
                                stats={monitoringStats}
                                setAvatarLoaded={setAvatarLoaded}
                                setAvatarError={setAvatarError}
                            />
                        </div>
                    </div>
                    {/* Site Status Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-medium text-slate-900 dark:text-slate-50">
                                Site Status - {selectedPerson.name} ({selectedPerson.id})
                            </h3>
                            <button
                                onClick={() => setIsMapModalOpen(true)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                            >
                                <MapPin size={16} className="inline-block" />
                                Plot Map
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300 text-sm">Person ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300 text-sm">Person Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300 text-sm">Date Time</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300 text-sm">Site Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300 text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300 text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSites.map((site, index) => (
                                        <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="py-3 px-4 text-slate-900 dark:text-slate-50 text-sm">{selectedPerson.id}</td>
                                            <td className="py-3 px-4 text-slate-900 dark:text-slate-50 text-sm">{selectedPerson.name}</td>
                                            <td className="py-3 px-4 text-slate-900 dark:text-slate-50 text-sm">{site.time}</td>
                                            <td className="py-3 px-4 text-slate-900 dark:text-slate-50 text-sm">{site.name}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${site.status === 'Alert'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {site.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline">
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {totalSites === 0 ? "Showing 0 of 0 entries" :
                                    `Showing ${((sitePage - 1) * sitesPerPage) + 1} to ${Math.min(sitePage * sitesPerPage, totalSites)} of ${totalSites} entries`}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded transition-colors ${sitePage === 1
                                        ? "opacity-50 cursor-not-allowed text-slate-400"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                    onClick={() => setSitePage(sitePage > 1 ? sitePage - 1 : 1)}
                                    disabled={sitePage === 1}
                                >
                                    Previous
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, idx) => (
                                        <button
                                            key={idx}
                                            className={`px-3 py-1 text-sm border rounded transition-colors ${sitePage === idx + 1
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                            onClick={() => setSitePage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className={`px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded transition-colors ${sitePage === totalPages
                                        ? "opacity-50 cursor-not-allowed text-slate-400"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                    onClick={() => setSitePage(sitePage < totalPages ? sitePage + 1 : totalPages)}
                                    disabled={sitePage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                    <PlotSitesMapModal
                        isOpen={isMapModalOpen}
                        onRequestClose={() => setIsMapModalOpen(false)}
                        sites={selectedPerson.sites}
                        person={selectedPerson}
                    />
                    <Footer />
                </>
            )}
        </div>
    );
};

export default DashboardPage;