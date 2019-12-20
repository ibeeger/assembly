// The entry file of your WebAssembly module.


declare namespace window {
	function show(v:number):void;
}


export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function invert(byteSize: i32): i32 {
  for (var i = 0; i < byteSize; i += 4) {
    let pos = i + byteSize; 
    store<u8>(pos, 255 - load<u8>(i));
    store<u8>(pos + 1, 255 - load<u8>(i + 1));
    store<u8>(pos + 2, 255 - load<u8>(i + 2));
    store<u8>(pos + 3, 255);
  }
  return 0;
}

export function grayscale(byteSize: i64): i64 {
  for (var i = 0; i < byteSize; i += 4) {
    let pos = i+byteSize;
    const avg = u8(0.3  *  load<u8>(i) + 0.59 * load<u8>(i + 1) + 0.11 * load<u8>(i + 2));
    store<u8>(pos, avg);
    store<u8>(pos + 1, avg);
    store<u8>(pos + 2, avg);
    store<u8>(pos + 3, 255);
  }
  return 0;
}

export function format (a:Int8Array):Int8Array {
	return new Int8Array(10)
}


export function loop (a: i32): i32 {
	let j =0;
	for(let i=0; i<a; i++) {
       j+=i;
	}
	return j;
}
