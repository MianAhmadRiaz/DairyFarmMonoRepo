require 'xcodeproj'

project_path = 'CattlesCare.xcodeproj'
target_name  = 'CattlesCare'
swift_file   = 'CattlesCare/FixSwiftLinking.swift'
bridging_hdr = 'CattlesCare/CattlesCare-Bridging-Header.h'

project = Xcodeproj::Project.open(project_path)
target  = project.targets.find { |t| t.name == target_name }
raise "Target #{target_name} not found" unless target

# Find or create the CattlesCare group
group = project.main_group.find_subpath('CattlesCare', true)

# --- Add the Swift file to the project + compile sources phase (once) ---
unless target.source_build_phase.files_references.any? { |r| r.path && r.path.end_with?('FixSwiftLinking.swift') }
  file_ref = group.new_reference('CattlesCare/FixSwiftLinking.swift')
  target.source_build_phase.add_file_reference(file_ref)
  puts "Added FixSwiftLinking.swift to #{target_name} sources"
else
  puts "FixSwiftLinking.swift already in sources"
end

# --- Ensure a bridging header exists (Xcode requires one for mixed targets) ---
bridging_full = File.join(File.dirname(project_path), bridging_hdr)
unless File.exist?(bridging_full)
  File.write(bridging_full, "//\n// CattlesCare-Bridging-Header.h\n// Empty bridging header required for the Swift/Obj-C mixed target.\n//\n")
  puts "Created bridging header"
end
unless group.files.any? { |f| f.path == 'CattlesCare-Bridging-Header.h' }
  group.new_reference('CattlesCare-Bridging-Header.h')
end

# --- Build settings on every config of the app target ---
target.build_configurations.each do |config|
  bs = config.build_settings
  bs['SWIFT_VERSION'] = '5.0' unless bs['SWIFT_VERSION']
  bs['SWIFT_OBJC_BRIDGING_HEADER'] = bridging_hdr
  bs['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'YES'
  bs['CLANG_ENABLE_MODULES'] = 'YES'
  # Optimization: keep debug builds unoptimized
  bs['SWIFT_OPTIMIZATION_LEVEL'] ||= '-Onone'
  puts "Configured settings for #{config.name}"
end

project.save
puts "Project saved."
