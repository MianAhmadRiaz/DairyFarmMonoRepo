//
//  FixSwiftLinking.swift
//  CattlesCare
//
//  This file exists solely so that the (otherwise Objective-C only) app target
//  compiles Swift. That forces Xcode to link the Swift runtime and the Swift
//  backward-compatibility shim libraries (e.g. swiftCompatibility56) that
//  Firebase's precompiled Swift code depends on.
//
//  Without a Swift file in the target, linking fails with:
//    Undefined symbol: __swift_FORCE_LOAD_$_swiftCompatibility56
//
//  Do not delete.
//

import Foundation
