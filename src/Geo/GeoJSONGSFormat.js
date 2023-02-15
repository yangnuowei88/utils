/**
 * @classdesc  读写GeoJSON。创建一个新的解析器JSON格式化类。
 *
 */
export const GeoJSONGSFormat = GeoGlobe.Class4OL(GeoGlobe.Format.JSON, {
    /**
     * ignoreExtraDims- 读取几何时忽略高于2的尺寸。
     * @memberof GeoJSONGSFormat.prototype
     * @type {Boolean}
     */

    ignoreExtraDims: true,

    /**
     * 为GeoJSON创建一个新的解析器。
     * @param {Object} options - 一个可选对象，其属性将在此实例上设置。
     */

    /**
     *  反序列化GeoJSON字符串。
     * @memberof GeoJSONGSFormat.prototype
     * @param {String}json -  一个GeoJSON字符串
     * @param {String}type -  用于确定输出结构的可选字符串。 支持的值是“Geometry”，
     * “feature”和“FeatureCollection”。
     * 如果缺失或为空，则假定缺省为“FeatureCollection”。
     * @param {Function} filter - 将在最终结果的每个级别调用每个键和值的函数。
     * 每个值将被过滤器功能的结果替换。
     * 这可用于将通用对象改为类的实例，
     * 或将日期字符串转换为Date对象。
     * @returns {Object} 返回值取决于类型参数的值。
     * 如果type是“FeatureCollection”（默认），则返回将是一个GeoGlobe.Feature数组。
     * 如果type是“Geometry”，则输入json必须表示单个几何体，并且返回将是GeoGlobe.Geometry。
     * 如果type是“Feature”，则输入json必须表示一个特征，返回值将是GeoGlobe.Feature。
     */
    transformRead: function (json, type, filter) {
        type = type ? type : 'FeatureCollection';
        let results = null;
        let obj = null;
        if (typeof json == 'string') {
            obj = GeoGlobe.Format.JSON.prototype.read.apply(this, [
                json,
                filter,
            ]);
        } else {
            obj = json;
        }
        if (!obj) {
            GeoGlobe.Console.error('Bad JSON: ' + json);
        } else if (typeof obj.type != 'string') {
            GeoGlobe.Console.error('Bad GeoJSON - no type: ' + json);
        } else if (this.isValidType(obj, type)) {
            switch (type) {
                case 'Geometry':
                    try {
                        results = this.parseGeometry(obj);
                    } catch (err) {
                        GeoGlobe.Console.error(err);
                    }
                    break;
                case 'Feature':
                    try {
                        results = this.parseFeature(obj);
                        results.type = 'Feature';
                    } catch (err) {
                        GeoGlobe.Console.error(err);
                    }
                    break;
                case 'FeatureCollection':
                    // for type FeatureCollection, we allow input to be any type
                    results = [];
                    switch (obj.type) {
                        case 'Feature':
                            try {
                                results.push(this.parseFeature(obj));
                            } catch (err) {
                                results = null;
                                GeoGlobe.Console.error(err);
                            }
                            break;
                        case 'FeatureCollection':
                            for (
                                let i = 0, len = obj.features.length;
                                i < len;
                                ++i
                            ) {
                                try {
                                    results.push(
                                        this.parseFeature(obj.features[i])
                                    );
                                } catch (err) {
                                    results = null;
                                    GeoGlobe.Console.error(err);
                                }
                            }
                            break;
                        default:
                            try {
                                const geom = this.parseGeometry(obj);
                                results.push(new GeoGlobe.Feature(geom));
                            } catch (err) {
                                results = null;
                                GeoGlobe.Console.error(err);
                            }
                    }
                    break;
            }
        }
        return results;
    },

    /**
     * Check if a GeoJSON object is a valid representative of the given type.
     * @memberof GeoJSONGSFormat.prototype
     * @returns {Boolean} The object is valid GeoJSON object of the given type.
     * @private
     */
    isValidType: function (obj, type) {
        let valid = false;
        switch (type) {
            case 'Geometry':
                if (
                    GeoGlobe.Util.indexOf(
                        [
                            'Point',
                            'MultiPoint',
                            'LineString',
                            'MultiLineString',
                            'Polygon',
                            'MultiPolygon',
                            'Box',
                            'GeometryCollection',
                        ],
                        obj.type
                    ) == -1
                ) {
                    // unsupported geometry type
                    GeoGlobe.Console.error(
                        'Unsupported geometry type: ' + obj.type
                    );
                } else {
                    valid = true;
                }
                break;
            case 'FeatureCollection':
                // allow for any type to be converted to a feature collection
                valid = true;
                break;
            default:
                // for Feature types must match
                if (obj.type == type) {
                    valid = true;
                } else {
                    GeoGlobe.Console.error(
                        'Cannot convert types from ' + obj.type + ' to ' + type
                    );
                }
        }
        return valid;
    },

    /**
     * Convert a feature object from GeoJSON into an
     *     GeoGlobe.Feature.
     * @memberof GeoJSONGSFormat.prototype
     * @param {Object}obj - An object created from a GeoJSON object
     * @returns {GeoGlobe.Feature} A feature.
     * @private
     */
    parseFeature: function (obj) {
        let feature, geometry, attributes, bbox;
        attributes = obj.properties ? obj.properties : {};
        bbox = (obj.geometry && obj.geometry.bbox) || obj.bbox;
        // eslint-disable-next-line no-useless-catch
        try {
            geometry = this.parseGeometry(obj.geometry);
        } catch (err) {
            // deal with bad geometries
            throw err;
        }
        feature = new GeoGlobe.Feature(geometry, attributes);
        if (bbox) {
            feature.bounds = GeoGlobe.LngLatBounds.fromArray(bbox);
        }
        if (obj.id) {
            feature.fid = obj.id;
        }
        return feature;
    },

    /**
     * Convert a geometry object from GeoJSON into an GeoGlobe.Geometry.
     * @memberof GeoJSONGSFormat.prototype
     * @param {Object}obj - An object created from a GeoJSON object
     * @returns {GeoGlobe.Geometry} A geometry.
     * @private
     */
    parseGeometry: function (obj) {
        if (obj == null) {
            return null;
        }
        let geometry,
            collection = false;
        if (obj.type == 'GeometryCollection') {
            if (!GeoGlobe.Util.isArray(obj.geometries)) {
                throw 'GeometryCollection must have geometries array: ' + obj;
            }
            const numGeom = obj.geometries.length;
            const components = new Array(numGeom);
            for (let i = 0; i < numGeom; ++i) {
                components[i] = this.parseGeometry.apply(this, [
                    obj.geometries[i],
                ]);
            }
            geometry = new GeoGlobe.Geometry.Collection(components);
            collection = true;
        } else {
            if (!GeoGlobe.Util.isArray(obj.coordinates)) {
                throw 'Geometry must have coordinates array: ' + obj;
            }
            if (!this.parseCoords[obj.type.toLowerCase()]) {
                throw 'Unsupported geometry type: ' + obj.type;
            }
            // eslint-disable-next-line no-useless-catch
            try {
                geometry = this.parseCoords[obj.type.toLowerCase()].apply(
                    this,
                    [obj.coordinates]
                );
            } catch (err) {
                // deal with bad coordinates
                throw err;
            }
        }
        // We don't reproject collections because the children are reprojected
        // for us when they are created.
        if (this.internalProjection && this.externalProjection && !collection) {
            geometry.transform(
                this.externalProjection,
                this.internalProjection
            );
        }
        return geometry;
    },

    meterToDegree: function (meter) {
        const degree =
            meter /
            ((Cesium.Math.TWO_PI * Cesium.Ellipsoid.WGS84.radii.x) / 360);
        return degree;
    },

    degreeToMeter: function (degrees) {
        return degrees * (Math.PI / 180.0) * Cesium.Ellipsoid.WGS84.radii.x;
    },

    //笛卡尔坐标转换为高斯坐标，仅在平面三维模式下使用。
    getGaussFromCartesianMy: function (cartesian, extent, x) {
        const webMerProj = new Cesium.WebMercatorProjection();
        const lonlat = [30, 0]; //经纬度[30,0]对应的墨卡托坐标[3339584.723798207, 0]
        const mercatorCoord = webMerProj.project(
            Cesium.Cartographic.fromDegrees(lonlat[0], lonlat[1])
        );
        //墨卡托坐标[3339584.723798207, 0]
        const e = [mercatorCoord.x, mercatorCoord.y];

        const radCoord = Cesium.Cartographic.fromCartesian(cartesian);
        //墨卡托坐标 参数cartesian转为墨卡托坐标
        x = webMerProj.project(radCoord, x);
        let i = 0;
        const yy = Cesium['defined'](extent)
            ? ((i = (extent['xmin'] + extent['xmax']) / 2 - e[0]),
              (extent['ymin'] + extent['ymax']) / 2 - e[1])
            : ((i = e[0]), e[1]);
        return (x.x = x.x + i), (x.y = x.y + yy), x;
    },

    //高斯坐标转换为笛卡尔坐标，仅在平面三维模式下使用。
    getCartesianFromGaussMy: function (x, y, height, extent, result) {
        const cartographic = this.getCartographicFromGaussMy(
            x,
            y,
            height,
            extent
        );
        if (!Cesium.defined(result)) {
            result = new Cesium.Cartesian3();
        }
        const ret = Cesium.Cartographic.toCartesian(
            cartographic,
            Cesium.Ellipsoid.WGS84,
            result
        );
        return ret;
    },

    getCartographicFromGaussMy: function (x, y, height, extent) {
        let s = null;
        height = Cesium.defaultValue(height, 0);
        let r = [30, 0];
        const cart3 = new Cesium.WebMercatorProjection().project(
            Cesium.Cartographic.fromDegrees(r[0], r[1])
        );
        //墨卡托坐标[3339584.723798207, 0]
        r = [cart3.x, cart3.y];
        if (Cesium.defined(extent)) {
            s = (extent.xmin + extent.xmax) / 2 - r[0];
            r = (extent.ymin + extent.ymax) / 2 - r[1];
        } else {
            s = r[0];
            r = r[1];
        }
        const webMerProj = new Cesium.WebMercatorProjection();
        const cartographic = webMerProj.unproject(
            new Cesium.Cartesian3(x - s, y - r, height)
        );
        return cartographic;
    },

    getRenderDegreeFromGaussMy: function (x, y, height, extent) {
        const cartographic = this.getCartographicFromGaussMy(
            x,
            y,
            height,
            extent
        );
        const xyRes = {};
        xyRes.x = Cesium.Math.toDegrees(cartographic.longitude);
        xyRes.y = Cesium.Math.toDegrees(cartographic.latitude);
        return xyRes;
    },

    /**
     *Object with properties corresponding to the GeoJSON geometry types.
     *     Property values are functions that do the actual parsing.
     * @memberof GeoJSONGSFormat.prototype
     * @type {null}
     * @private
     */
    parseCoords: {
        /**
         * Convert a coordinate array from GeoJSON into an
         *     GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {Object}array -  The coordinates array from the GeoJSON fragment.
         *
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        point: function (array) {
            if (this.ignoreExtraDims == false && array.length != 2) {
                throw 'Only 2D points are supported: ' + array;
            }
            //var cartesian3 = Cesium.Cartesian3.fromGauss(array[0], array[1], 0, extent);
            const extent = Cesium.viewerObj.localOptions.extent;
            let offsetX = 0;
            let offsetY = 0;
            let x = 0;
            let y = 0;
            if (this.toGauss) {
                offsetX =
                    (extent['xmin'] + extent['xmax']) / 2 -
                    this.degreeToMeter(30);
                offsetY = (extent['ymin'] + extent['ymax']) / 2 - 0;

                x = array[0] + offsetX;
                y = array[1] + offsetY;
            } else {
                // offsetX =
                //     30 -
                //     this.meterToDegree((extent['xmin'] + extent['xmax']) / 2);
                // offsetY =
                //     0 -
                //     this.meterToDegree((extent['ymin'] + extent['ymax']) / 2);
                // x = array[0] + offsetX;
                // y = array[1] + offsetY;

                const webMerProj = new Cesium.WebMercatorProjection();
                //还原为高斯坐标
                const gauss = webMerProj.project(
                    Cesium.Cartographic.fromDegrees(array[0], array[1])
                );
                //得到渲染要素的经纬度坐标
                const xy = this.getRenderDegreeFromGaussMy(
                    gauss.x,
                    gauss.y,
                    0,
                    extent
                );
                x = xy.x;
                y = xy.y;
            }
            return new GeoGlobe.Geometry.Point(x, y);
        },

        /**
         * Convert a coordinate array from GeoJSON into an
         *   GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {Object}array -  The coordinates array from the GeoJSON fragment.
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        multipoint: function (array) {
            const points = [];
            let p = null;
            for (let i = 0, len = array.length; i < len; ++i) {
                // eslint-disable-next-line no-useless-catch
                try {
                    p = this.parseCoords['point'].apply(this, [array[i]]);
                } catch (err) {
                    throw err;
                }
                points.push(p);
            }
            return new GeoGlobe.Geometry.MultiPoint(points);
        },

        /**
         *  Convert a coordinate array from GeoJSON into an
            GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {Object}array -  The coordinates array from the GeoJSON fragment.
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        linestring: function (array) {
            const points = [];
            let p = null;
            for (let i = 0, len = array.length; i < len; ++i) {
                // eslint-disable-next-line no-useless-catch
                try {
                    p = this.parseCoords['point'].apply(this, [array[i]]);
                } catch (err) {
                    throw err;
                }
                points.push(p);
            }
            return new GeoGlobe.Geometry.LineString(points);
        },

        /**
         * Convert a coordinate array from GeoJSON into an
         *     GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {Object}array -  The coordinates array from the GeoJSON fragment.
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        multilinestring: function (array) {
            const lines = [];
            let l = null;
            for (let i = 0, len = array.length; i < len; ++i) {
                // eslint-disable-next-line no-useless-catch
                try {
                    l = this.parseCoords['linestring'].apply(this, [array[i]]);
                } catch (err) {
                    throw err;
                }
                lines.push(l);
            }
            return new GeoGlobe.Geometry.MultiLineString(lines);
        },

        /**
         * Convert a coordinate array from GeoJSON into an
             GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        polygon: function (array) {
            const rings = [];
            let r, l;
            for (let i = 0, len = array.length; i < len; ++i) {
                // eslint-disable-next-line no-useless-catch
                try {
                    l = this.parseCoords['linestring'].apply(this, [array[i]]);
                } catch (err) {
                    throw err;
                }
                r = new GeoGlobe.Geometry.LinearRing(l.components);
                rings.push(r);
            }
            return new GeoGlobe.Geometry.Polygon(rings);
        },

        /**
         * Convert a coordinate array from GeoJSON into an
            GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {Object} array - The coordinates array from the GeoJSON fragment.
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        multipolygon: function (array) {
            const polys = [];
            let p = null;
            for (let i = 0, len = array.length; i < len; ++i) {
                // eslint-disable-next-line no-useless-catch
                try {
                    p = this.parseCoords['polygon'].apply(this, [array[i]]);
                } catch (err) {
                    throw err;
                }
                polys.push(p);
            }
            return new GeoGlobe.Geometry.MultiPolygon(polys);
        },

        /**
         * Convert a coordinate array from GeoJSON into an
             GeoGlobe.Geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {Object} array - The coordinates array from the GeoJSON fragment.
         * @returns {GeoGlobe.Geometry} A geometry.
         * @private
         */
        box: function (array) {
            if (array.length != 2) {
                throw 'GeoJSON box coordinates must have 2 elements';
            }
            return new GeoGlobe.Geometry.Polygon([
                new GeoGlobe.Geometry.LinearRing([
                    new GeoGlobe.Geometry.Point(array[0][0], array[0][1]),
                    new GeoGlobe.Geometry.Point(array[1][0], array[0][1]),
                    new GeoGlobe.Geometry.Point(array[1][0], array[1][1]),
                    new GeoGlobe.Geometry.Point(array[0][0], array[1][1]),
                    new GeoGlobe.Geometry.Point(array[0][0], array[0][1]),
                ]),
            ]);
        },
    },

    /**
     * 将要素，几何图形和要素数组序列化为GeoJSON字符串。
     * @memberof GeoJSONGSFormat.prototype
     * @param {Object}obj -  GeoGlobe.Feature，GeoGlobe.Geometry，或一系列功能。
     * @param {Boolean}pretty - 用换行符和缩进结构化输出。 默认为false。
     * @returns {String} 输入几何体，要素或要素阵列的GeoJSON字符串表示形式。
     */
    write: function (obj, pretty) {
        let geojson = {
            type: null,
        };
        if (GeoGlobe.Util.isArray(obj)) {
            geojson.type = 'FeatureCollection';
            const numFeatures = obj.length;
            geojson.features = new Array(numFeatures);
            for (let i = 0; i < numFeatures; ++i) {
                const element = obj[i];
                if (!(element instanceof GeoGlobe.Feature)) {
                    const msg =
                        'FeatureCollection only supports collections ' +
                        'of features: ' +
                        element;
                    throw msg;
                }
                geojson.features[i] = this.extract.feature.apply(this, [
                    element,
                ]);
            }
        } else if (obj.CLASS_NAME.indexOf('GeoGlobe.Geometry') == 0) {
            geojson = this.extract.geometry.apply(this, [obj]);
        } else if (obj instanceof GeoGlobe.Feature) {
            geojson = this.extract.feature.apply(this, [obj]);
            if (obj.layer && obj.layer.projection) {
                geojson.crs = this.createCRSObject(obj);
            }
        }
        return GeoGlobe.Format.JSON.prototype.write.apply(this, [
            geojson,
            pretty,
        ]);
    },

    /**
     *  Create the CRS object for an object.
     * @memberof GeoJSONGSFormat.prototype
     * @param {GeoGlobe.Feature} object -
     * @returns {Object} An object which can be assigned to the crs property
     * @private
     */
    createCRSObject: function (object) {
        const proj = object.layer.projection.toString();
        let crs = {};
        if (proj.match(/epsg:/i)) {
            const code = parseInt(proj.substring(proj.indexOf(':') + 1));
            if (code == 4326) {
                crs = {
                    type: 'name',
                    properties: {
                        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
                    },
                };
            } else {
                crs = {
                    type: 'name',
                    properties: {
                        name: 'EPSG:' + code,
                    },
                };
            }
        }
        return crs;
    },

    /**
     * extract Object with properties corresponding to the GeoJSON types.
       Property values are functions that do the actual value extraction.
     * @memberof GeoJSONGSFormat.prototype
     * @type {null}
     * @private
     */
    extract: {
        /**
         *  Return a partial GeoJSON object representing a single feature.
         * @memberof GeoJSONGSFormat.prototype
         *@param {GeoGlobe.Feature}feature -
         *
         *@returns {Object} An object representing the point.
         *@private
         */
        feature: function (feature) {
            const geom = this.extract.geometry.apply(this, [feature.geometry]);
            const json = {
                type: 'Feature',
                properties: feature.attributes,
                geometry: geom,
            };
            if (feature.fid != null) {
                json.id = feature.fid;
            }
            return json;
        },

        /**
         * Return a GeoJSON object representing a single geometry.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry}geometry
         * @returns {Object} An object representing the geometry.
         * @private
         */
        geometry: function (geometry) {
            if (geometry == null) {
                return null;
            }
            if (this.internalProjection && this.externalProjection) {
                geometry = geometry.clone();
                geometry.transform(
                    this.internalProjection,
                    this.externalProjection
                );
            }
            const geometryType = geometry.CLASS_NAME.split('.')[2];
            const data = this.extract[geometryType.toLowerCase()].apply(this, [
                geometry,
            ]);
            let json;
            if (geometryType == 'Collection') {
                json = {
                    type: 'GeometryCollection',
                    geometries: data,
                };
            } else {
                json = {
                    type: geometryType,
                    coordinates: data,
                };
            }

            return json;
        },

        /**
         * Return an array of coordinates from a point.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.Point}point -
         * @returns {Array} An array of coordinates representing the point.
         * @private
         */
        point: function (point) {
            return [point.x, point.y];
        },

        /**
         * Return an array of point coordinates from a multipoint.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.MultiPoint}multipoint -
         *
         * @returns {Array} An array of point coordinate arrays representing
         *     the multipoint.
         * @private
         */
        multipoint: function (multipoint) {
            const array = [];
            for (let i = 0, len = multipoint.components.length; i < len; ++i) {
                array.push(
                    this.extract.point.apply(this, [multipoint.components[i]])
                );
            }
            return array;
        },

        /**
         * Return an array of coordinate arrays from a linestring.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.LineString}linestring -
         * @returns {Array} An array of coordinate arrays representing
         *     the linestring.
         * @private
         */
        linestring: function (linestring) {
            const array = [];
            for (let i = 0, len = linestring.components.length; i < len; ++i) {
                array.push(
                    this.extract.point.apply(this, [linestring.components[i]])
                );
            }
            return array;
        },

        /**
         * Return an array of linestring arrays from a linestring.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.MultiLineString}multilinestring -
         * @returns {Array} An array of linestring arrays representing
         *     the multilinestring.
         * @private
         */
        multilinestring: function (multilinestring) {
            const array = [];
            for (
                let i = 0, len = multilinestring.components.length;
                i < len;
                ++i
            ) {
                array.push(
                    this.extract.linestring.apply(this, [
                        multilinestring.components[i],
                    ])
                );
            }
            return array;
        },

        /**
         * Return an array of linear ring arrays from a polygon.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.Polygon}polygon -
         * @returns {Array} An array of linear ring arrays representing the polygon.
         * @private
         */
        polygon: function (polygon) {
            const array = [];
            for (let i = 0, len = polygon.components.length; i < len; ++i) {
                array.push(
                    this.extract.linestring.apply(this, [polygon.components[i]])
                );
            }
            return array;
        },

        /**
         * Return an array of polygon arrays from a multipolygon.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.MultiPolygon}multipolygon -
         * @returns {Array} An array of polygon arrays representing
         *     the multipolygon
         * @private
         */
        multipolygon: function (multipolygon) {
            const array = [];
            for (
                let i = 0, len = multipolygon.components.length;
                i < len;
                ++i
            ) {
                array.push(
                    this.extract.polygon.apply(this, [
                        multipolygon.components[i],
                    ])
                );
            }
            return array;
        },

        /**
         *  Return an array of geometries from a geometry collection.
         * @memberof GeoJSONGSFormat.prototype
         * @param {GeoGlobe.Geometry.Collection}collection -
         * @returns {Array} An array of geometry objects representing the geometry
         *     collection.
         * @private
         */
        collection: function (collection) {
            const len = collection.components.length;
            const array = new Array(len);
            for (let i = 0; i < len; ++i) {
                array[i] = this.extract.geometry.apply(this, [
                    collection.components[i],
                ]);
            }
            return array;
        },
    },

    CLASS_NAME: 'GeoJSONGSFormat',
});
