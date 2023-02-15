import { isArray } from 'util';

const geoJsonFormat = GeoGlobe && new GeoGlobe.Format.GeoJSON();

export const FeatureUtil = {
    /**
     * feature转换
     * @param {*} mapboxFeature
     */
    transformFeature(mapboxFeature) {
        return geoJsonFormat.read(mapboxFeature, 'Feature');
    },

    /**
     * feature转换
     * @param {Array} mapboxFeatures
     */
    transformFeatures(mapboxFeatures) {
        return geoJsonFormat.read({
            type: 'FeatureCollection',
            features: mapboxFeatures,
        });
    },

    /**
     * 转为GeoJson
     * @param {Geometry|Feature} value
     * @param {Boolean} retureFeature 总是返回feature
     */
    transform2GeoJson(value, retureFeature = false) {
        const check = value[0] || value;

        if (!check.CLASS_NAME) {
            return value;
        }
        let g = geoJsonFormat.write(value);
        g = JSON.parse(g);
        if (retureFeature) {
            if (g && !['FeatureCollection', 'Feature'].includes(g.type)) {
                g = {
                    type: 'Feature',
                    geometry: g,
                    properties: {},
                };
            }
        }
        return g;
    },

    /**
     * 获取Bounds
     * @param {GeoGlobe.Feature | Array.<GeoGlobe.Feature>} feature
     */
    getBounds(feature) {
        let arr = [feature];
        if (isArray(feature)) {
            arr = feature;
        }
        if (
            arr[0].geometry &&
            !(arr[0].geometry instanceof GeoGlobe.Geometry)
        ) {
            arr = this.transformFeatures(arr);
        }
        return GeoGlobe.Feature.getBoundsByFeatures(arr);
    },

    /**
     * 获取中心点
     * @param {GeoGlobe.Feature | Array.<GeoGlobe.Feature>} feature
     * @returns {Object} lng lat
     */
    getCenter(feature) {
        return this.getBounds(feature).getCenter();
    },

    /**
     * 获取中心点
     * @param {GeoGlobe.Feature | Array.<GeoGlobe.Feature>} feature
     * @returns {GeoGlobe.Geometry} 几何点
     */
    getCenterInSide(feature) {
        let glbPointGeometry = null;
        if (
            feature.geometry.type == 'Polygon' ||
            feature.geometry.type == 'MultiPolygon'
        ) {
            const centerGeojson = GeoGlobe.Geometry.Polygon.getCenterInSide(
                feature
            );
            // const format = new GeoGlobe.Format.GeoJSON();
            const glbPoint = geoJsonFormat.read(centerGeojson, 'Feature');
            glbPointGeometry = glbPoint.geometry;
        } else {
            const center = this.getBounds(feature).getCenter();
            glbPointGeometry = new GeoGlobe.Geometry.Point(
                center.lng,
                center.lat
            );
        }
        return glbPointGeometry;
    },

    /**
     * 获取指定位置坐标
     * @param {GeoGlobe.Feature} feature
     * @param {Number} i
     */
    getCoordinateAtIndex(feature, i = 0) {
        if (
            feature &&
            feature.geometry &&
            feature.geometry instanceof GeoGlobe.Geometry
        ) {
            // do nothing
        } else {
            feature = this.transformFeature(feature);
        }
        /**
         * @type {Array}
         */
        const coords = feature.geometry.getVertices();
        if (i >= 0) {
            return coords[i];
        }
        if (i < 0) {
            return coords[coords.length + i];
        }
    },

    /**
     * 计算夹角
     * @param {*} line1 线段一
     * @param {*} line2 线段二
     * @returns {Number} 夹角
     */
    /* eslint-disable camelcase */
    calcDirection(line1, line2) {
        // 第一条线段取最后两位坐标
        const [coord1_1, coord1_2] = line1.getVertices().slice(-2);
        // 第二条线段取最前两位坐标
        const [coord2_1, coord2_2] = line2.getVertices().slice(0, 2);

        // 弧度表示
        const angle1 =
            (Math.atan2(coord1_1.y - coord1_2.y, coord1_2.x - coord1_1.x) *
                180) /
            Math.PI;
        const angle2 =
            (Math.atan2(coord2_1.y - coord2_2.y, coord2_2.x - coord2_1.x) *
                180) /
            Math.PI;

        return (180 - angle1 + angle2 + 360) % 360;
    },

    /**
     * feature转为有效的坐标字符串
     * @param {Feature|Array.<String|Number>|Array.<Feature>} value
     */
    toLngLatString(value) {
        if (value instanceof GeoGlobe.Feature) {
            return value.geometry
                .getVertices()
                .map(v => v.toShortString())
                .join(';');
        } else if (isArray(value) && value.length > 0) {
            // Array Feature
            if (value[0] instanceof GeoGlobe.Feature) {
                return value.map(v => this.toLngLatString(v)).join(';');
            }
            // 坐标数组
            else {
                return value.join(',');
            }
        }
        return '';
    },
    /**
     * entity转为geojson
     * @param {Cesium.Map} map
     * @param {Cesium.Entity} entityFeature
     */
    entityToGeoJson(entityFeature) {
        const points = [];
        const feature = entityFeature.polygon || entityFeature.polyline;
        if (entityFeature.polygon) {
            feature.hierarchy.getValue().positions.forEach((element, index) => {
                const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
                    element
                );
                const lon = Cesium.Math.toDegrees(cartographic.longitude);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const isIndex = points.findIndex(
                    p => p.toString() == [lon, lat].toString()
                );
                if (isIndex < 0 || index == 0) {
                    points.push([lon, lat]);
                }
                if (
                    index ==
                    feature.hierarchy.getValue().positions.length - 1
                ) {
                    points.push(points[0]);
                }
            });

            return turf.polygon([points]);
        } else if (entityFeature.polyline) {
            feature.positions.getValue().forEach(element => {
                const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
                    element
                );
                const lon = Cesium.Math.toDegrees(cartographic.longitude);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                points.push([lon, lat]);
            });
            return turf.lineString(points);
        } else {
            const position = entityFeature.position.getValue();
            const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
                position
            );
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            return turf.point([lon, lat]);
        }
    },
};
