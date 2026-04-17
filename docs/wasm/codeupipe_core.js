/* @ts-self-types="./codeupipe_core.d.ts" */

/**
 * Mutable data container for bulk writes. Convert back to immutable
 * with `.toImmutable()`.
 */
export class MutablePayload {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MutablePayload.prototype);
        obj.__wbg_ptr = ptr;
        MutablePayloadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MutablePayloadFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mutablepayload_free(ptr, 0);
    }
    /**
     * Get a value by key.
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.mutablepayload_get(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Create a new empty MutablePayload.
     */
    constructor() {
        const ret = wasm.mutablepayload_new();
        this.__wbg_ptr = ret >>> 0;
        MutablePayloadFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Set a value in place. Mutates this payload.
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mutablepayload_set(this.__wbg_ptr, ptr0, len0, value);
    }
    /**
     * Convert back to an immutable Payload.
     * @returns {Payload}
     */
    toImmutable() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.mutablepayload_toImmutable(ptr);
        return Payload.__wrap(ret);
    }
}
if (Symbol.dispose) MutablePayload.prototype[Symbol.dispose] = MutablePayload.prototype.free;

/**
 * Immutable data container for pipeline processing.
 * Create with `WasmPayload.new(jsObject)`, read with `.get(key)`,
 * produce new payloads with `.insert(key, value)`.
 */
export class Payload {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Payload.prototype);
        obj.__wbg_ptr = ptr;
        PayloadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PayloadFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_payload_free(ptr, 0);
    }
    /**
     * Record a processing step in lineage (internal).
     * @param {string} step_name
     * @returns {Payload}
     */
    _stamp(step_name) {
        const ptr0 = passStringToWasm0(step_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.payload__stamp(this.__wbg_ptr, ptr0, len0);
        return Payload.__wrap(ret);
    }
    /**
     * Deserialize payload from JSON bytes.
     * @param {Uint8Array} raw
     * @returns {Payload}
     */
    static deserialize(raw) {
        const ptr0 = passArray8ToWasm0(raw, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.payload_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Payload.__wrap(ret[0]);
    }
    /**
     * Get a value by key. Returns undefined if not found.
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.payload_get(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Return a new Payload with the key set to value.
     * The original payload is unchanged (immutable).
     * @param {string} key
     * @param {any} value
     * @returns {Payload}
     */
    insert(key, value) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.payload_insert(this.__wbg_ptr, ptr0, len0, value);
        return Payload.__wrap(ret);
    }
    /**
     * Alias for insert — same semantics, different name for type evolution.
     * @param {string} key
     * @param {any} value
     * @returns {Payload}
     */
    insertAs(key, value) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.payload_insertAs(this.__wbg_ptr, ptr0, len0, value);
        return Payload.__wrap(ret);
    }
    /**
     * The lineage as a JS array of strings.
     * @returns {Array<any>}
     */
    get lineage() {
        const ret = wasm.payload_lineage(this.__wbg_ptr);
        return ret;
    }
    /**
     * Merge another payload into this one.
     * Returns a new payload — other's keys take precedence.
     * @param {Payload} other
     * @returns {Payload}
     */
    merge(other) {
        _assertClass(other, Payload);
        const ret = wasm.payload_merge(this.__wbg_ptr, other.__wbg_ptr);
        return Payload.__wrap(ret);
    }
    /**
     * Create a new Payload from a JS object.
     * ```js
     * const p = new Payload({ name: "test", count: 42 });
     * ```
     * @param {any} data
     */
    constructor(data) {
        const ret = wasm.payload_new(data);
        this.__wbg_ptr = ret >>> 0;
        PayloadFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Serialize payload to JSON bytes.
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm.payload_serialize(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Return all data as a plain JS object.
     * @returns {any}
     */
    toDict() {
        const ret = wasm.payload_toDict(this.__wbg_ptr);
        return ret;
    }
    /**
     * The trace ID, or undefined.
     * @returns {any}
     */
    get traceId() {
        const ret = wasm.payload_traceId(this.__wbg_ptr);
        return ret;
    }
    /**
     * Convert to a mutable payload for bulk writes.
     * @returns {MutablePayload}
     */
    withMutation() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.payload_withMutation(ptr);
        return MutablePayload.__wrap(ret);
    }
    /**
     * Return a new Payload with a trace ID attached.
     * @param {string} trace_id
     * @returns {Payload}
     */
    withTrace(trace_id) {
        const ptr0 = passStringToWasm0(trace_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.payload_withTrace(this.__wbg_ptr, ptr0, len0);
        return Payload.__wrap(ret);
    }
}
if (Symbol.dispose) Payload.prototype[Symbol.dispose] = Payload.prototype.free;

/**
 * Pipeline orchestrator — add filters, run, read state.
 *
 * ```js
 * const pipeline = new Pipeline();
 * pipeline.addFilter("step1", (payload) => payload.insert("done", true));
 * const result = pipeline.run(new Payload({ input: "data" }));
 * console.log(pipeline.state.executed); // ["step1"]
 * ```
 */
export class Pipeline {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PipelineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pipeline_free(ptr, 0);
    }
    /**
     * Add a JS function as a filter step.
     *
     * The callback receives a `Payload` and must return a `Payload`.
     * ```js
     * pipeline.addFilter("validate", (payload) => {
     *     if (!payload.get("email")) throw new Error("No email");
     *     return payload.insert("valid", true);
     * });
     * ```
     * @param {string} name
     * @param {Function} callback
     */
    addFilter(name, callback) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.pipeline_addFilter(this.__wbg_ptr, ptr0, len0, callback);
    }
    /**
     * Describe the pipeline structure as a JS array of { name, type } objects.
     * @returns {Array<any>}
     */
    describe() {
        const ret = wasm.pipeline_describe(this.__wbg_ptr);
        return ret;
    }
    /**
     * Create a new empty Pipeline.
     */
    constructor() {
        const ret = wasm.pipeline_new();
        this.__wbg_ptr = ret >>> 0;
        PipelineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Enable observation features.
     * @param {boolean} timing
     * @param {boolean} lineage
     */
    observe(timing, lineage) {
        wasm.pipeline_observe(this.__wbg_ptr, timing, lineage);
    }
    /**
     * Execute the pipeline synchronously.
     * Returns the final Payload after all filters have run.
     * @param {Payload} initial
     * @returns {Payload}
     */
    run(initial) {
        _assertClass(initial, Payload);
        var ptr0 = initial.__destroy_into_raw();
        const ret = wasm.pipeline_run(this.__wbg_ptr, ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Payload.__wrap(ret[0]);
    }
    /**
     * Pipeline execution state — available after run().
     * @returns {State}
     */
    get state() {
        const ret = wasm.pipeline_state(this.__wbg_ptr);
        return State.__wrap(ret);
    }
}
if (Symbol.dispose) Pipeline.prototype[Symbol.dispose] = Pipeline.prototype.free;

/**
 * Pipeline execution state — read-only view of what happened during run.
 */
export class State {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(State.prototype);
        obj.__wbg_ptr = ptr;
        StateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_state_free(ptr, 0);
    }
    /**
     * Error details as a JS array of [stepName, message] pairs.
     * @returns {Array<any>}
     */
    get errors() {
        const ret = wasm.state_errors(this.__wbg_ptr);
        return ret;
    }
    /**
     * Filters that executed.
     * @returns {Array<any>}
     */
    get executed() {
        const ret = wasm.state_executed(this.__wbg_ptr);
        return ret;
    }
    /**
     * Whether any errors occurred.
     * @returns {boolean}
     */
    get hasErrors() {
        const ret = wasm.state_hasErrors(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The last error message, or undefined.
     * @returns {any}
     */
    get lastError() {
        const ret = wasm.state_lastError(this.__wbg_ptr);
        return ret;
    }
    /**
     * Filters that were skipped.
     * @returns {Array<any>}
     */
    get skipped() {
        const ret = wasm.state_skipped(this.__wbg_ptr);
        return ret;
    }
    /**
     * Timing data as a JS object { filterName: seconds }.
     * @returns {any}
     */
    get timings() {
        const ret = wasm.state_timings(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) State.prototype[Symbol.dispose] = State.prototype.free;

/**
 * Initialize the WASM module. Call once on page load.
 * Sets up panic hook for better error messages in the console.
 */
export function init() {
    wasm.init();
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_7c536b7a8123d334: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg___wbindgen_boolean_get_6abe7d340f528f63: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_is_function_d4c2480b46f29e33: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_77356bc8da6bb199: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_object_e04e3a51a90cde43: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_5957b329897cc39c: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_4fcba947d278ad7c: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_ae6081df8158aa73: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_bd5a70920abf0236: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_1aea13500fe8ff6c: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_faf6b66fc4667ce6: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
        __wbg_entries_e234c7de8150095c: function(arg0) {
            const ret = Object.entries(arg0);
            return ret;
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_from_7bbac5c419024362: function(arg0) {
            const ret = Array.from(arg0);
            return ret;
        },
        __wbg_get_8944f33c9c7f4f6c: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_d8a3d51a73d14c8a: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_unchecked_c33f0e513c522d7c: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_instanceof_Window_4bfad3a9470c25c9: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_8dc932f4b6997756: function(arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_length_713cc1160ce7b5b9: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_480195ddf7042529: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_e4597c3f125a2038: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_now_1925e14eb84a904c: function(arg0) {
            const ret = arg0.now();
            return ret;
        },
        __wbg_payload_new: function(arg0) {
            const ret = Payload.__wrap(arg0);
            return ret;
        },
        __wbg_performance_6c4d39832e915483: function(arg0) {
            const ret = arg0.performance;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_push_bb0def92a641d074: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_set_05b085c909633819: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_44bef9fa6011e260: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_13002645baf43d84: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_91d0abd4d035416c: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_513f857c65724fc7: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./codeupipe_core_bg.js": import0,
    };
}

const MutablePayloadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_mutablepayload_free(ptr >>> 0, 1));
const PayloadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_payload_free(ptr >>> 0, 1));
const PipelineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pipeline_free(ptr >>> 0, 1));
const StateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_state_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('codeupipe_core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
