// Mapboxの設定
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2dwbGF5ZXIiLCJhIjoiY200OXBzcmI1MGR6bzJxcTFrdDJ1MGJyNSJ9.o_VpEScSsAPdt8U8PDB58Q';

// 地図の初期化
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    projection: 'globe',
    zoom: 2
});

// ナビゲーションコントロールの追加
map.addControl(new mapboxgl.NavigationControl());

// ミニマップの初期化
let minimap = new mapboxgl.Map({
    container: 'minimap-container',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [0, 0],
    zoom: 1,
    interactive: false,
    attributionControl: false,
    logoPosition: 'bottom-right'
});

// メインマップの移動時にビューポートインジケーターを更新
map.on('move', updateViewportIndicator);
map.on('zoom', updateViewportIndicator);

function updateViewportIndicator() {
    const mainBounds = map.getBounds();
    const mainCenter = map.getCenter();
    
    // ミニマップの中心をメインマップの中心に合わせる
    minimap.setCenter(mainCenter);
    
    // メインマップの範囲をミニマップの座標系に変換
    const topLeft = minimap.project([mainBounds.getWest(), mainBounds.getNorth()]);
    const bottomRight = minimap.project([mainBounds.getEast(), mainBounds.getSouth()]);
    
    const indicator = document.getElementById('viewport-indicator');
    if (indicator) {
        indicator.style.left = topLeft.x + 'px';
        indicator.style.top = topLeft.y + 'px';
        indicator.style.width = (bottomRight.x - topLeft.x) + 'px';
        indicator.style.height = (bottomRight.y - topLeft.y) + 'px';
    }
}

// 地図のスタイルが読み込まれたときの処理
map.on('style.load', () => {
    map.setFog({});
    
    // 国境レイヤーを追加
    map.addSource('countries', {
        'type': 'vector',
        'url': 'mapbox://mapbox.country-boundaries-v1'
    });

    // データソースが読み込まれたときの処理
    map.on('sourcedata', (e) => {
        if (e.sourceId === 'countries' && e.isSourceLoaded) {
            console.log('Countries data loaded successfully');
            
            // データの構造を確認
            const source = map.getSource('countries');
            console.log('Source:', source);
            
            // レイヤーの追加を試みる
            try {
                // 連合国側の国境レイヤー
                map.addLayer({
                    'id': 'allied-countries',
                    'type': 'fill',
                    'source': 'countries',
                    'source-layer': 'country_boundaries',
                    'layout': {
                        'visibility': 'none'
                    },
                    'paint': {
                        'fill-color': '#4CAF50',
                        'fill-opacity': 0.3
                    },
                    'filter': [
                        'any',
                        ['==', ['get', 'iso_3166_1'], 'US'],
                        ['==', ['get', 'iso_3166_1'], 'GB'],
                        ['==', ['get', 'iso_3166_1'], 'RU'],
                        ['==', ['get', 'iso_3166_1'], 'CN'],
                        ['==', ['get', 'iso_3166_1'], 'FR'],
                        ['==', ['get', 'iso_3166_1'], 'CA'],
                        ['==', ['get', 'iso_3166_1'], 'AU'],
                        ['==', ['get', 'iso_3166_1'], 'NZ'],
                        ['==', ['get', 'iso_3166_1'], 'IN'],
                        ['==', ['get', 'iso_3166_1'], 'ZA']
                    ]
                });
                console.log('Allied countries layer added');

                // 枢軸国側の国境レイヤー
                map.addLayer({
                    'id': 'axis-countries',
                    'type': 'fill',
                    'source': 'countries',
                    'source-layer': 'country_boundaries',
                    'layout': {
                        'visibility': 'none'
                    },
                    'paint': {
                        'fill-color': '#f44336',
                        'fill-opacity': 0.3
                    },
                    'filter': [
                        'any',
                        ['==', ['get', 'iso_3166_1'], 'DE'],
                        ['==', ['get', 'iso_3166_1'], 'IT'],
                        ['==', ['get', 'iso_3166_1'], 'JP'],
                        ['==', ['get', 'iso_3166_1'], 'HU'],
                        ['==', ['get', 'iso_3166_1'], 'RO'],
                        ['==', ['get', 'iso_3166_1'], 'FI'],
                        ['==', ['get', 'iso_3166_1'], 'BG'],
                        ['==', ['get', 'iso_3166_1'], 'TH'],
                        ['==', ['get', 'iso_3166_1'], 'RS']
                    ]
                });
                console.log('Axis countries layer added');

                // 国境線レイヤー
                map.addLayer({
                    'id': 'country-borders',
                    'type': 'line',
                    'source': 'countries',
                    'source-layer': 'country_boundaries',
                    'layout': {
                        'visibility': 'none'
                    },
                    'paint': {
                        'line-color': '#ffffff',
                        'line-width': 1
                    }
                });
                console.log('Country borders layer added');
            } catch (error) {
                console.error('Error adding layers:', error);
            }
        }
    });
});

// 現在のマーカーを保持する変数
let currentMarker = null;

// マーカーを更新する関数
function updateMarker(longitude, latitude) {
    if (currentMarker) {
        currentMarker.remove();
    }

    currentMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([longitude, latitude])
        .addTo(map);
}

// 地図の中心を移動する関数
function flyToLocation(longitude, latitude) {
    map.flyTo({
        center: [longitude, latitude],
        zoom: 10,
        bearing: 45,
        pitch: 45,
        speed: 1.2,
        curve: 1.5
    });
}

// 日本地図に移動する関数
function flyToJapan() {
    map.flyTo({
        center: [138.2529, 36.2048],
        zoom: 5,
        bearing: 0,
        pitch: 0,
        speed: 1.2,
        curve: 1.5
    });
}

// 世界地図に移動する関数
function flyToWorld() {
    map.flyTo({
        center: [15, 45], // ヨーロッパの中心付近（経度15度、緯度45度）
        zoom: 3, // ズームレベルを調整
        bearing: 0,
        pitch: 0,
        speed: 1.2,
        curve: 1.5
    });
} 

let currentYear = 1938;
let isMapVisible = true; // 地図の表示状態を管理する変数を追加

function getCountryColor(name) {
    // 国名から一意の色を生成（ハッシュベースの簡易実装）
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 60%)`;
}

function getPolygonCenter(coordinates) {
    if (!coordinates || !coordinates.length) return null;

    let x = 0;
    let y = 0;
    let count = 0;

    // 座標の配列を平坦化して処理
    const flattenCoordinates = (coords) => {
        if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            // ネストされた配列の場合、再帰的に処理
            return coords.flatMap(flattenCoordinates);
        }
        return coords;
    };

    const flatCoords = flattenCoordinates(coordinates);

    // すべての座標の平均を計算
    for (let i = 0; i < flatCoords.length; i++) {
        if (Array.isArray(flatCoords[i]) && flatCoords[i].length >= 2) {
            x += flatCoords[i][0];
            y += flatCoords[i][1];
            count++;
        }
    }

    if (count === 0) return null;

    return [x / count, y / count];
}

async function loadBorders(year) {
    // 既存レイヤー削除
    if (map.getSource('borders')) {
        if (map.getLayer('borders-label')) map.removeLayer('borders-label');
        if (map.getLayer('borders-fill')) map.removeLayer('borders-fill');
        if (map.getLayer('borders-layer')) map.removeLayer('borders-layer');
        map.removeSource('borders');
    }
    if (map.getSource('borders-labels')) {
        if (map.getLayer('borders-label')) map.removeLayer('borders-label');
        map.removeSource('borders-labels');
    }
    // GeoJSONファイルのパス
    const url = year === 1938 ? '1938WW2.geojson' : 
                year === 1945 ? '1945WW2.geojson' : 
                '2024.geojson';
    console.log('Loading borders for year:', year, 'from URL:', url);
    
    try {
    const response = await fetch(url);
    const geojson = await response.json();
        console.log('Loaded GeoJSON:', geojson);

    // 国ごとに色を割り当てるプロパティを追加
    geojson.features.forEach(f => {
            if (year === 2024) {
                // 2024年のデータ用の特別な処理
                const countryIdentifier = f.properties.ISO_A3_EH || f.properties.ISO_N3 || f.properties.NAME_JA || f.properties.NAME_EN || '';
                f.properties._fillColor = getCountryColor(countryIdentifier);
                // 日本語名をNAMEプロパティとして設定
                f.properties.NAME = f.properties.NAME_JA || f.properties.NAME_EN || '';
            } else {
        f.properties._fillColor = getCountryColor(f.properties.NAME || f.properties.ABBREVNAME || f.properties.FIPS_CODE || '');
            }
    });

    // 国ごとに1つだけ中心点を作る
    const labelMap = {};
    geojson.features.forEach(f => {
        const name = f.properties.NAME;
        if (!labelMap[name]) {
            // ポリゴンの中心を計算
            let center = null;
                if (f.geometry && f.geometry.coordinates) {
                center = getPolygonCenter(f.geometry.coordinates);
            }
            if (center) {
                labelMap[name] = {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: center },
                    properties: { NAME: name }
                };
            }
        }
    });
    const labelGeojson = {
        type: 'FeatureCollection',
        features: Object.values(labelMap)
    };

        // ソースを追加
    map.addSource('borders', { type: 'geojson', data: geojson });
        map.addSource('borders-labels', { type: 'geojson', data: labelGeojson });

        // ソースの読み込みを待ってからレイヤーを追加
        map.on('sourcedata', (e) => {
            if (e.sourceId === 'borders' && e.isSourceLoaded) {
    // 塗りつぶしレイヤー
                if (!map.getLayer('borders-fill')) {
    map.addLayer({
        id: 'borders-fill',
        type: 'fill',
        source: 'borders',
        paint: {
            'fill-color': ['get', '_fillColor'],
            'fill-opacity': 0.5
        }
    });
                }
    // 境界線レイヤー
                if (!map.getLayer('borders-layer')) {
    map.addLayer({
        id: 'borders-layer',
        type: 'line',
        source: 'borders',
        paint: {
                            'line-color': year === 1938 ? '#2196f3' : 
                                        year === 1945 ? '#f44336' : 
                                        '#4CAF50',
            'line-width': 2
        }
    });
                }
            }
            if (e.sourceId === 'borders-labels' && e.isSourceLoaded) {
                // ラベルレイヤー
                if (!map.getLayer('borders-label')) {
    map.addLayer({
        id: 'borders-label',
        type: 'symbol',
        source: 'borders-labels',
        layout: {
            'text-field': ['get', 'NAME'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14,
            'text-anchor': 'center',
            'text-allow-overlap': true
        },
        paint: {
            'text-color': '#222',
            'text-halo-color': '#fff',
            'text-halo-width': 2
                        }
                    });
                }
        }
    });

    // Mapboxの既存ラベルを非表示
    const labelLayerIds = [
        'country-label', 'state-label', 'settlement-major-label', 'settlement-minor-label',
        'poi-label', 'water-point-label', 'water-line-label', 'natural-point-label',
        'natural-line-label', 'road-label', 'transit-label', 'airport-label', 'place-label'
    ];
    labelLayerIds.forEach(id => {
        if (map.getLayer(id)) {
            map.setLayoutProperty(id, 'visibility', 'none');
        }
    });
    } catch (error) {
        console.error('Error loading borders:', error);
    }
}

// 地図初期化時に1938年をデフォルト表示
map.on('load', () => {
    loadBorders(1938);
});

// 年代切り替えボタンのイベントリスナー
window.addEventListener('DOMContentLoaded', () => {
    const btn1938 = document.getElementById('btn-1938');
    const btn1945 = document.getElementById('btn-1945');
    const btn2024 = document.getElementById('btn-2024');

    function updateButtonStates(activeButton) {
        [btn1938, btn1945, btn2024].forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('inactive');
        });
        if (isMapVisible) {
            activeButton.classList.add('active');
        } else {
            activeButton.classList.add('inactive');
        }
    }

    function toggleMapVisibility() {
                if (map.getLayer('borders-fill')) {
                    map.setLayoutProperty('borders-fill', 'visibility', isMapVisible ? 'visible' : 'none');
                }
                if (map.getLayer('borders-layer')) {
                    map.setLayoutProperty('borders-layer', 'visibility', isMapVisible ? 'visible' : 'none');
                }
                if (map.getLayer('borders-label')) {
                    map.setLayoutProperty('borders-label', 'visibility', isMapVisible ? 'visible' : 'none');
                }
    }

    if (btn1938 && btn1945 && btn2024) {
        btn1938.addEventListener('click', () => {
            if (currentYear === 1938) {
                isMapVisible = !isMapVisible;
                toggleMapVisibility();
                updateButtonStates(btn1938);
            } else {
                currentYear = 1938;
                isMapVisible = true;
                updateButtonStates(btn1938);
                loadBorders(1938);
            }
        });

        btn1945.addEventListener('click', () => {
            if (currentYear === 1945) {
                isMapVisible = !isMapVisible;
                toggleMapVisibility();
                updateButtonStates(btn1945);
            } else {
                currentYear = 1945;
                isMapVisible = true;
                updateButtonStates(btn1945);
                loadBorders(1945);
            }
        });

        btn2024.addEventListener('click', () => {
            if (currentYear === 2024) {
                isMapVisible = !isMapVisible;
                toggleMapVisibility();
                updateButtonStates(btn2024);
            } else {
                currentYear = 2024;
                isMapVisible = true;
                updateButtonStates(btn2024);
                loadBorders(2024);
            }
        });
    }
}); 