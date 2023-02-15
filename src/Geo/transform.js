import { GeoJSONGSFormat } from './GeoJSONGSFormat';

export const transform = {
    /**
     * 米转度 2PI * r = 圆周长 ， meter / (圆周长 / 360度)
     * @param meter
     * @returns {number}
     */
    meterToDegree(meter) {
        const degree =
            meter /
            ((Cesium.Math.TWO_PI * Cesium.Ellipsoid.WGS84.radii.x) / 360);
        return degree;
        //const a = 0.00000899; //赤道上的距离1公里=0.000008993220293度
    },

    /**
     * 度转米
     * @param degrees
     * @returns {number}
     */
    degreeToMeter(degrees) {
        return degrees * (Math.PI / 180.0) * Cesium.Ellipsoid.WGS84.radii.x;
    },
    //radians * 180.0 / Math.PI   //radians to degree

    /**
     * 弧度的定义:弧长/半径=弧度 ， 所以弧长=半径*弧度
     * @param radians
     * @returns {number}
     */
    radToMeter(radians) {
        return radians * Cesium.Ellipsoid.WGS84.radii.x;
    },

    /**
     * extent坐标转换
     * @param extent
     * @param epsgFROM
     * @param epsgTO
     * @returns {GeoGlobe.LngLatBounds|*}
     */
    transformBounds(extent, epsgFROM = 'EPSG:4326', epsgTO = 'EPSG:3857') {
        if (extent instanceof GeoGlobe.LngLatBounds) {
            const extentGeometry = extent
                .toGeometry()
                .transform(
                    new GeoGlobe.SpatialReference(epsgFROM),
                    new GeoGlobe.SpatialReference(epsgTO)
                );
            extent = extentGeometry.getBounds();
            return extent;
        }
        return extent;
    },

    /**
     * geometry坐标转换
     * @param geometry
     * @param epsgFROM
     * @param epsgTO
     * @returns {*|GeoGlobe.Geometry}
     */
    transformGeometry(geometry, epsgFROM = 'EPSG:4326', epsgTO = 'EPSG:3857') {
        if (geometry instanceof GeoGlobe.Geometry) {
            geometry = geometry.transform(
                new GeoGlobe.SpatialReference(epsgFROM),
                new GeoGlobe.SpatialReference(epsgTO)
            );
            return geometry;
        }
        return geometry;
    },

    /**
     * feature坐标转换
     * @param feature
     * @param epsgFROM
     * @param epsgTO
     * @returns {GeoGlobe.Feature|*}
     */
    transformFeature(feature, epsgFROM = 'EPSG:4326', epsgTO = 'EPSG:3857') {
        if (feature instanceof GeoGlobe.Feature) {
            feature.geometry = feature.geometry.transform(
                new GeoGlobe.SpatialReference(epsgFROM),
                new GeoGlobe.SpatialReference(epsgTO)
            );
            return feature;
        }
        return feature;
    },

    /**
     *
     * @param geojson
     * @param epsgFROM
     * @param epsgTO
     * @returns {*}
     */
    transformGeoJsonFeature(
        geojson,
        epsgFROM = 'EPSG:4326',
        epsgTO = 'EPSG:3857'
    ) {
        const features = GeoGlobe.Feature.fromGeoJson(geojson);
        features.forEach(f => {
            f.geometry = f.geometry.transform(
                new GeoGlobe.SpatialReference(epsgFROM),
                new GeoGlobe.SpatialReference(epsgTO)
            );
        });
        geojson = GeoGlobe.FeatureUtil.transformGeoJson(features);
        return geojson;
    },

    /**
     * featureLLToGSLL
     * 墨卡托对应的经纬度坐标转gs对应的Cesium经纬度坐标。用于定位，绘制矢量。
     * @param feature
     * @param type 用于确定输出结构的可选字符串。 支持的值是“Geometry”，“feature”和“FeatureCollection”(默认)。
     */
    featureLLToGSLL(feature, type) {
        const format = new GeoJSONGSFormat();
        const json = format.write(feature);
        const gsllFeature = format.transformRead(json, type);
        return gsllFeature;
    },

    /**
     * 墨卡托坐标转高斯坐标
     * @param feature
     * @param type
     * @returns {*}
     */
    featureMercToGS(feature, type) {
        const format = new GeoJSONGSFormat({
            toGauss: true,
        });
        const json = format.write(feature);
        const gsFeature = format.transformRead(json, type);
        return gsFeature;
    },

    /**
     * geojson的高斯坐标转高斯坐标对应的Cesium经纬度坐标，用于定位，绘制矢量。
     * @param geojson
     * @returns {*}
     */
    geoJsonFeatureGSToGaussLL(geojson) {
        let geojson2 = transform.transformGeoJsonFeature(
            geojson,
            'EPSG:3857',
            'EPSG:4326'
        );
        let features = GeoGlobe.Feature.fromGeoJson(geojson2);
        // 转gs对应的Cesium经纬度坐标
        features = transform.featureLLToGSLL(features, 'FeatureCollection');
        geojson2 = GeoGlobe.FeatureUtil.transformGeoJson(features);
        return geojson2;
    },

    /**
     * 根据高斯坐标的boundingBox字符串获得CesiumRectangle对象
     * @param boundingBox
     * @returns {Rectangle}
     */
    getCesiumRectangleByGaussBBox(boundingBox) {
        if (!boundingBox) {
            return null;
        }
        const bboxArray = boundingBox.split(',').map(e => {
            return Number(e);
        });
        const polygon = GeoGlobe.LngLatBounds.fromArray(bboxArray).toGeometry();
        const feature = new GeoGlobe.Feature(polygon);
        const format = new GeoGlobe.Format.GeoJSON();
        const geojsonStr = format.write(feature);
        const geojson = JSON.parse(geojsonStr);
        const geojsonLL = this.geoJsonFeatureGSToGaussLL(geojson);
        const featureLL = format.read(geojsonLL.features[0], 'Feature');
        const bboxLLStr = featureLL.geometry.getBounds().toBBOX();
        const bboxLLArray = bboxLLStr.split(',').map(e => {
            return Number(e);
        });
        const rectangle = new Cesium.Rectangle.fromDegrees(
            bboxLLArray[0],
            bboxLLArray[1],
            bboxLLArray[2],
            bboxLLArray[3]
        );
        return rectangle;
    },

    /**
     * 笛卡尔坐标转换
     * @param {*} coordinate
     * @returns
     */
    transCartesian(coordinate) {
        let cartesian3 = null;
        if (Cesium.projectionType == '3857') {
            cartesian3 = Cesium.Cartesian3.fromGauss(
                coordinate[0],
                coordinate[1],
                0,
                Cesium.viewerObj.localOptions.extent
            );
        } else {
            cartesian3 = Cesium.Cartesian3.fromDegrees(
                coordinate[0],
                coordinate[1],
                0
            );
        }
        return cartesian3;
    },

    /**
     * 单个高斯坐标转对应的Cesium经纬度坐标，用于定位，绘制矢量。
     * @param {Array} coordinate
     * @param extent
     */
    gaussToRenderLonLat(coordinate, extent) {
        const x = coordinate[0];
        const y = coordinate[1];
        extent = extent || Cesium.viewerObj.localOptions.extent;
        const lonlat = new GeoJSONGSFormat().getRenderDegreeFromGaussMy(
            x,
            y,
            0,
            extent
        );
        return [lonlat.x, lonlat.y];
    },

    /**
     * 单个用于定位，绘制矢量的Cesium经纬度坐标转高斯坐标
     * @param {Array} coordinate
     * @param extent
     */
    renderLonLatToGauss(coordinate, extent) {
        const cartesian = Cesium.Cartesian3.fromDegrees(
            coordinate[0],
            coordinate[1],
            0
        );
        extent = extent || Cesium.viewerObj.localOptions.extent;
        const gauss = Cesium.Cartesian3.toGauss(cartesian, extent);
        return [gauss.x, gauss.y];
    },
};
